import { InventoryLog, Product } from '../models/index.js';

export const reduceStockForOrder = async (order: any) => {
  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (!product) continue;
    const previousStock = product.stock;
    product.stock = Math.max(0, product.stock - item.quantity);
    await product.save();
    await InventoryLog.create({
      productId: product._id,
      previousStock,
      newStock: product.stock,
      changeAmount: product.stock - previousStock,
      reason: 'paid_order',
      orderId: order._id
    });
  }
};

export const restoreStockForOrder = async (order: any, adminId?: string) => {
  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (!product) continue;
    const previousStock = product.stock;
    product.stock += item.quantity;
    await product.save();
    await InventoryLog.create({
      productId: product._id,
      previousStock,
      newStock: product.stock,
      changeAmount: item.quantity,
      reason: 'cancelled_or_refunded_order',
      adminId,
      orderId: order._id
    });
  }
};
