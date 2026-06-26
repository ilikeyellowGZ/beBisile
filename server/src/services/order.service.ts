import { z } from 'zod';
import { findTrustedProduct } from './trustedCatalog.js';
import { DiscountCode, Order, Product, StoreSettings } from '../models/index.js';

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  selectedVariant: z.unknown().optional()
}).strict();

const shippingPartners = [
  { id: 'postnet-to-postnet', name: 'PostNet to PostNet', price: 109.99 },
  { id: 'paxi-to-paxi', name: 'PAXI to PAXI', price: 109.99 },
  { id: 'courier-guy-pudo', name: 'Courier GUY (PUDO)', price: 149.99 },
  { id: 'postnet-to-address', name: 'PostNet to Address', price: 349.99 }
];

const getShippingPartner = (id?: string) => shippingPartners.find((option) => option.id === id) || shippingPartners[0];
const productLookup = (productId: string) => ({
  $or: [
    ...(productId.match(/^[a-f\d]{24}$/i) ? [{ _id: productId }] : []),
    { id: productId },
    { slug: productId },
    { legacyId: productId },
    { sku: productId },
  ],
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  customerInfo: z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional()
  }).strict(),
  shippingAddress: z.record(z.unknown()).optional(),
  shippingPartner: z.object({
    id: z.string().min(1)
  }).strict().optional(),
  discountCode: z.string().optional()
}).strict();

export const createOrderNumber = () => `BIS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export const calculateTrustedOrder = async (input: z.infer<typeof checkoutSchema>) => {
  const trustedItems = [];

  for (const item of input.items) {
    const product = await Product.findOne(productLookup(item.productId));
    const catalogProduct = findTrustedProduct(item.productId);

    if (product) {
      if (product.isActive === false || product.isArchived === true) throw Object.assign(new Error('Product is not available'), { statusCode: 400 });
      const productStock = Number(product.stock ?? 0);
      if (productStock <= 0 || item.quantity > productStock) throw Object.assign(new Error(`${product.name} does not have enough stock`), { statusCode: 400 });

      trustedItems.push({
        product,
        documentId: product._id,
        trustedProductId: item.productId,
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        selectedVariant: item.selectedVariant,
        unitPrice: Number(product.price ?? 0),
        totalPrice: Number(product.price ?? 0) * item.quantity
      });
      continue;
    }

    if (!catalogProduct || !catalogProduct.available) throw Object.assign(new Error('Product is not available'), { statusCode: 400 });
    if (item.quantity > catalogProduct.stock) throw Object.assign(new Error(`${catalogProduct.name} does not have enough stock`), { statusCode: 400 });

    trustedItems.push({
      product: null,
      productId: undefined,
      trustedProductId: catalogProduct.id,
      productName: catalogProduct.name,
      quantity: item.quantity,
      selectedVariant: item.selectedVariant,
      unitPrice: catalogProduct.price,
      totalPrice: catalogProduct.price * item.quantity
    });
  }

  const subtotal = trustedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  let discountAmount = 0;
  let discountCode: string | undefined;

  if (input.discountCode) {
    const discount = await DiscountCode.findOne({ code: input.discountCode.toUpperCase(), isActive: true });
    if (!discount || (discount.expiresAt && discount.expiresAt < new Date())) throw Object.assign(new Error('Invalid discount code'), { statusCode: 400 });
    if (discount.minimumOrderAmount && subtotal < discount.minimumOrderAmount) throw Object.assign(new Error('Discount minimum not met'), { statusCode: 400 });
    if (discount.maxUses && discount.usedCount >= discount.maxUses) throw Object.assign(new Error('Discount usage limit reached'), { statusCode: 400 });
    discountCode = discount.code;
    const discountValue = Number(discount.value ?? 0);
    discountAmount = discount.type === 'percentage' ? subtotal * (discountValue / 100) : discountValue;
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const settings = await StoreSettings.findOne();
  const shippingPartner = getShippingPartner(input.shippingPartner?.id);
  const deliveryFee = shippingPartner.price;
  const taxAmount = settings?.taxRate ? (subtotal - discountAmount) * (settings.taxRate / 100) : 0;
  const totalAmount = subtotal - discountAmount + deliveryFee + taxAmount;

  return {
    trustedItems,
    subtotal,
    discountCode,
    discountAmount,
    shippingPartner,
    deliveryFee,
    taxAmount,
    totalAmount,
    currency: settings?.currency || 'ZAR'
  };
};

export const createPendingOrder = async (input: z.infer<typeof checkoutSchema>, calculated: Awaited<ReturnType<typeof calculateTrustedOrder>>) => {
  return Order.create({
    orderNumber: createOrderNumber(),
    customerInfo: input.customerInfo,
    shippingAddress: input.shippingAddress || {},
    shippingPartner: calculated.shippingPartner,
    items: calculated.trustedItems.map((item) => ({
      productId: item.productId,
      trustedProductId: item.trustedProductId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      selectedVariant: item.selectedVariant
    })),
    subtotal: calculated.subtotal,
    discountCode: calculated.discountCode,
    discountAmount: calculated.discountAmount,
    deliveryFee: calculated.deliveryFee,
    taxAmount: calculated.taxAmount,
    totalAmount: calculated.totalAmount,
    currency: calculated.currency,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    shippingStatus: 'not_shipped'
  });
};
