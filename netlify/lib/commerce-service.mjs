import { ObjectId } from 'mongodb';
import { collectionNames, getDb, normalizeMoney, now, toObjectId } from './secure-db.mjs';

const forbiddenPriceFields = ['price', 'unitPrice', 'total', 'totalAmount', 'subtotal', 'discountAmount', 'finalAmount', 'amount'];

export const parseJsonBody = (event) => {
  if (!event.body) return {};
  return JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body);
};

export const rejectFrontendPrices = (value, path = 'body') => {
  if (!value || typeof value !== 'object') return;
  for (const key of Object.keys(value)) {
    if (forbiddenPriceFields.includes(key)) {
      const error = new Error(`Frontend price field "${path}.${key}" is not allowed`);
      error.statusCode = 400;
      throw error;
    }
    if (Array.isArray(value[key])) value[key].forEach((item, index) => rejectFrontendPrices(item, `${path}.${key}[${index}]`));
    else if (typeof value[key] === 'object') rejectFrontendPrices(value[key], `${path}.${key}`);
  }
};

const productLookup = (productId) => {
  const objectId = toObjectId(productId);
  return {
    $or: [
      ...(objectId ? [{ _id: objectId }] : []),
      { id: productId },
      { slug: productId },
      { legacyId: productId },
      { sku: productId },
    ],
  };
};

export const getTrustedProduct = async (db, productId) => {
  const product = await db.collection(collectionNames.products).findOne(productLookup(productId));
  if (!product) {
    const error = new Error(`Product not found: ${productId}`);
    error.statusCode = 404;
    throw error;
  }
  return product;
};

export const validateDiscount = async (db, code, subtotal) => {
  if (!code) return { code: null, amount: 0 };
  const discount = await db.collection(collectionNames.discountCodes).findOne({
    code: String(code).trim().toUpperCase(),
    isActive: { $ne: false },
    $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: now() } }],
  });

  if (!discount) {
    const error = new Error('Discount code is invalid or expired');
    error.statusCode = 400;
    throw error;
  }

  if (discount.maxUses && discount.usedCount >= discount.maxUses) {
    const error = new Error('Discount code usage limit reached');
    error.statusCode = 400;
    throw error;
  }

  if (discount.minimumOrderAmount && subtotal < discount.minimumOrderAmount) {
    const error = new Error('Order does not meet discount minimum');
    error.statusCode = 400;
    throw error;
  }

  const amount = discount.type === 'percentage'
    ? normalizeMoney(subtotal * (discount.value / 100))
    : normalizeMoney(discount.value);

  return { code: discount.code, amount: Math.min(amount, subtotal), discount };
};

export const calculateTrustedCheckout = async ({ items, discountCode }) => {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error('Checkout requires at least one item');
    error.statusCode = 400;
    throw error;
  }

  const db = await getDb();
  const checkoutItems = [];

  for (const rawItem of items) {
    const productId = rawItem.productId || rawItem.id;
    const quantity = Number(rawItem.quantity);
    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      const error = new Error('Invalid cart item. Send productId and quantity only.');
      error.statusCode = 400;
      throw error;
    }

    const product = await getTrustedProduct(db, productId);
    if (product.isActive === false || product.isArchived === true) {
      const error = new Error(`${product.name} is not available for purchase`);
      error.statusCode = 400;
      throw error;
    }

    const stock = Number(product.stock ?? 0);
    if (stock <= 0 || quantity > stock) {
      const error = new Error(`${product.name} does not have enough stock`);
      error.statusCode = 400;
      throw error;
    }

    const unitPrice = normalizeMoney(product.price);
    if (!unitPrice || unitPrice <= 0) {
      const error = new Error(`${product.name} does not have a valid backend price`);
      error.statusCode = 400;
      throw error;
    }

    checkoutItems.push({
      product,
      productId: product._id,
      productName: product.name,
      quantity,
      selectedVariant: rawItem.selectedVariant || rawItem.variant || null,
      stripePriceId: product.stripePriceId || null,
      unitPrice,
      totalPrice: normalizeMoney(unitPrice * quantity),
    });
  }

  const subtotal = normalizeMoney(checkoutItems.reduce((sum, item) => sum + item.totalPrice, 0));
  const { code, amount: discountAmount, discount } = await validateDiscount(db, discountCode, subtotal);
  const settings = await db.collection(collectionNames.storeSettings).findOne({}) || {};
  const deliveryFee = settings.freeDeliveryThreshold && subtotal >= settings.freeDeliveryThreshold
    ? 0
    : normalizeMoney(settings.deliveryFee ?? 0);
  const taxAmount = settings.taxRate ? normalizeMoney((subtotal - discountAmount) * (settings.taxRate / 100)) : 0;
  const totalAmount = normalizeMoney(subtotal - discountAmount + deliveryFee + taxAmount);

  return {
    db,
    checkoutItems,
    subtotal,
    discountCode: code,
    discountAmount,
    discount,
    deliveryFee,
    taxAmount,
    totalAmount,
    currency: settings.currency || 'ZAR',
  };
};

export const createOrderNumber = () => `BIS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export const mapOrderItems = (checkoutItems) => checkoutItems.map((item) => ({
  productId: item.productId,
  productName: item.productName,
  quantity: item.quantity,
  unitPrice: item.unitPrice,
  totalPrice: item.totalPrice,
  selectedVariant: item.selectedVariant,
  stripePriceId: item.stripePriceId,
}));

export const reduceStockForOrder = async (db, order, adminId = null) => {
  for (const item of order.items) {
    const id = item.productId instanceof ObjectId ? item.productId : toObjectId(item.productId);
    if (!id) continue;
    const product = await db.collection(collectionNames.products).findOne({ _id: id });
    if (!product) continue;
    const previousStock = Number(product.stock ?? 0);
    const newStock = Math.max(0, previousStock - item.quantity);
    await db.collection(collectionNames.products).updateOne({ _id: id }, { $set: { stock: newStock, updatedAt: now() } });
    await db.collection(collectionNames.inventoryLogs).insertOne({
      productId: id,
      previousStock,
      newStock,
      changeAmount: newStock - previousStock,
      reason: 'paid_order',
      adminId,
      orderId: order._id,
      createdAt: now(),
    });
  }
};
