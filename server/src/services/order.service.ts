import { z } from 'zod';
import { DiscountCode, Order, Product, StoreSettings } from '../models/index.js';

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  selectedVariant: z.unknown().optional()
}).strict();

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  customerInfo: z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional()
  }).strict(),
  shippingAddress: z.record(z.unknown()).optional(),
  discountCode: z.string().optional()
}).strict();

export const createOrderNumber = () => `BIS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export const calculateTrustedOrder = async (input: z.infer<typeof checkoutSchema>) => {
  const trustedItems = [];

  for (const item of input.items) {
    const product = await Product.findById(item.productId);
    if (!product || product.isActive === false || product.isArchived === true) throw Object.assign(new Error('Product is not available'), { statusCode: 400 });
    if (!product.stripePriceId) throw Object.assign(new Error('Product is missing Stripe Price ID'), { statusCode: 400 });
    if (product.stock <= 0 || item.quantity > product.stock) throw Object.assign(new Error(`${product.name} does not have enough stock`), { statusCode: 400 });

    trustedItems.push({
      product,
      productId: product._id,
      productName: product.name,
      quantity: item.quantity,
      selectedVariant: item.selectedVariant,
      unitPrice: product.price,
      totalPrice: product.price * item.quantity,
      stripePriceId: product.stripePriceId
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
    discountAmount = discount.type === 'percentage' ? subtotal * (discount.value / 100) : discount.value;
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const settings = await StoreSettings.findOne();
  const deliveryFee = settings?.freeDeliveryThreshold && subtotal >= settings.freeDeliveryThreshold ? 0 : settings?.deliveryFee || 0;
  const taxAmount = settings?.taxRate ? (subtotal - discountAmount) * (settings.taxRate / 100) : 0;
  const totalAmount = subtotal - discountAmount + deliveryFee + taxAmount;

  return {
    trustedItems,
    subtotal,
    discountCode,
    discountAmount,
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
    items: calculated.trustedItems.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      selectedVariant: item.selectedVariant,
      stripePriceId: item.stripePriceId
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
