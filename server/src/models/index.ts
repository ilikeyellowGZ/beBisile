import mongoose, { Schema } from 'mongoose';

const timestamps = { timestamps: true };

export const User = mongoose.model('User', new Schema({
  fullName: String,
  email: { type: String, lowercase: true, index: true },
  role: String,
  isActive: { type: Boolean, default: true }
}, timestamps));

export const Admin = mongoose.model('Admin', new Schema({
  fullName: { type: String, required: true },
  username: { type: String, lowercase: true, trim: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['owner', 'manager', 'support'], required: true },
  avatar: String,
  isActive: { type: Boolean, default: true },
  lastLoginAt: Date
}, timestamps));

export const Product = mongoose.model('Product', new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: String,
  shortDescription: String,
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  images: [String],
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: Number,
  currency: { type: String, default: 'ZAR' },
  sku: { type: String, index: true },
  stock: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 3 },
  sizes: [String],
  variants: [Schema.Types.Mixed],
  scentNotes: [String],
  productDetails: [String],
  ingredients: [String],
  materials: [String],
  tags: [String],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false }
}, timestamps));

export const Category = mongoose.model('Category', new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image: String,
  isActive: { type: Boolean, default: true }
}, timestamps));

export const Customer = mongoose.model('Customer', new Schema({
  fullName: String,
  email: { type: String, index: true },
  phone: String,
  addresses: [Schema.Types.Mixed],
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrderAt: Date,
  notes: String,
  isBlocked: { type: Boolean, default: false }
}, timestamps));

export const Cart = mongoose.model('Cart', new Schema({
  sessionId: { type: String, required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  items: [{ productId: { type: Schema.Types.ObjectId, ref: 'Product' }, quantity: Number, selectedVariant: Schema.Types.Mixed }],
  expiresAt: Date
}, timestamps));

export const Order = mongoose.model('Order', new Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  customerInfo: { fullName: String, email: String, phone: String },
  shippingAddress: Schema.Types.Mixed,
  shippingPartner: {
    id: String,
    name: String,
    price: Number
  },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    selectedVariant: Schema.Types.Mixed
  }],
  subtotal: Number,
  discountCode: String,
  discountAmount: Number,
  deliveryFee: Number,
  taxAmount: Number,
  totalAmount: Number,
  currency: { type: String, default: 'ZAR' },
  paymentStatus: { type: String, default: 'pending' },
  orderStatus: { type: String, default: 'pending' },
  shippingStatus: { type: String, default: 'not_shipped' },
  trackingNumber: String,
  paystackReference: { type: String, index: true },
  paystackAccessCode: String,
  paystackAuthorizationUrl: String,
  paystackTransactionId: String,
  paystackPaidAt: Date,
  paidAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  refundedAt: Date
}, timestamps));

export const Payment = mongoose.model('Payment', new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  paystackReference: { type: String, index: true },
  paystackTransactionId: String,
  amount: Number,
  currency: String,
  status: String,
  paymentMethod: String,
  receiptUrl: String,
  refundedAmount: { type: Number, default: 0 }
}, timestamps));

export const ShippingOption = mongoose.model('ShippingOption', new Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: String,
  price: Number,
  description: String,
  isActive: { type: Boolean, default: true }
}, timestamps));

export const EmailLog = mongoose.model('EmailLog', new Schema({
  provider: String,
  type: String,
  to: String,
  from: String,
  subject: String,
  status: String,
  providerResponse: Schema.Types.Mixed
}, timestamps));

export const Upload = mongoose.model('Upload', new Schema({
  localPath: String,
  cloudinaryUrl: String,
  publicId: String,
  resourceType: String,
  folder: String
}, timestamps));

export const AdminLog = mongoose.model('AdminLog', new Schema({
  type: String,
  message: String,
  detail: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
}));

export const Refund = mongoose.model('Refund', new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  amount: Number,
  reason: String,
  status: String,
  paystackRefundId: String,
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Admin' }
}, timestamps));

export const ContactMessage = mongoose.model('ContactMessage', new Schema({
  fullName: String,
  email: String,
  phone: String,
  subject: String,
  message: String,
  status: { type: String, default: 'new' }
}, timestamps));

export const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', new Schema({
  email: { type: String, required: true, unique: true },
  source: String,
  status: { type: String, default: 'active' },
  subscribedAt: Date,
  unsubscribedAt: Date
}, timestamps));

export const Review = mongoose.model('Review', new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  rating: Number,
  comment: String,
  status: { type: String, default: 'pending' }
}, timestamps));

export const DiscountCode = mongoose.model('DiscountCode', new Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: Number,
  minimumOrderAmount: Number,
  maxUses: Number,
  usedCount: { type: Number, default: 0 },
  expiresAt: Date,
  isActive: { type: Boolean, default: true }
}, timestamps));

export const InventoryLog = mongoose.model('InventoryLog', new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  previousStock: Number,
  newStock: Number,
  changeAmount: Number,
  reason: String,
  adminId: { type: Schema.Types.ObjectId, ref: 'Admin' },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  createdAt: { type: Date, default: Date.now }
}));

export const AuditLog = mongoose.model('AuditLog', new Schema({
  adminId: { type: Schema.Types.ObjectId, ref: 'Admin' },
  action: String,
  entityType: String,
  entityId: Schema.Types.Mixed,
  oldValue: Schema.Types.Mixed,
  newValue: Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now }
}));

export const StoreSettings = mongoose.model('StoreSettings', new Schema({
  storeName: String,
  storeEmail: String,
  storePhone: String,
  storeAddress: String,
  currency: { type: String, default: 'ZAR' },
  deliveryFee: Number,
  freeDeliveryThreshold: Number,
  taxRate: Number,
  socialLinks: Schema.Types.Mixed,
  maintenanceMode: { type: Boolean, default: false }
}, timestamps));
