import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { Category, ContactMessage, NewsletterSubscriber, Product, Review, StoreSettings } from '../models/index.js';
import { env } from '../config/env.js';
import { createBisileEmailHtml, escapeHtml, sendTransactionalEmail } from '../services/email.service.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.middleware.js';

export const publicRoutes = Router();

const contactSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().email().max(200),
  subject: z.string().trim().max(160).default('Website enquiry'),
  message: z.string().trim().min(3).max(5000),
}).strict();
const newsletterSchema = z.object({ email: z.string().email().max(200), source: z.string().trim().max(100).optional() }).strict();
const reviewSchema = z.object({
  productId: z.string().min(1),
  customerId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(2000),
}).strict();

publicRoutes.get('/products', asyncHandler(async (_req, res) => res.json({ products: await Product.find({ isActive: true, isArchived: false }).sort({ isFeatured: -1, createdAt: -1 }).lean() })));
publicRoutes.get('/products/:slug', asyncHandler(async (req, res) => res.json({ product: await Product.findOne({ slug: req.params.slug, isActive: true, isArchived: false }).lean() })));
publicRoutes.get('/categories', asyncHandler(async (_req, res) => res.json({ categories: await Category.find({ isActive: true }).sort({ name: 1 }).lean() })));
publicRoutes.post('/contact', validate(contactSchema), asyncHandler(async (req, res) => {
  const message = await ContactMessage.create({ ...req.body, status: 'new' });
  try {
    const settings = await StoreSettings.findOne().lean();
    const adminEmail = String(env.ADMIN_NOTIFICATION_EMAIL || settings?.storeEmail || '').trim();
    const customerEmail = String(req.body.email || '').trim();
    const name = String(req.body.fullName || 'Customer').trim();
    const subject = String(req.body.subject || 'New BISILE enquiry').trim();

    if (adminEmail) {
      const adminHtml = createBisileEmailHtml({
        title: 'New BISILE contact message',
        intro: 'A customer submitted a message through the BISILE contact form.',
        body: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(customerEmail)}</p><p><strong>Subject:</strong> ${escapeHtml(subject)}</p><p><strong>Message:</strong><br />${escapeHtml(String(req.body.message || '')).replace(/\n/g, '<br />')}</p>`,
        footer: 'This message was sent from the public BISILE contact form.',
      });
      await sendTransactionalEmail({
        to: adminEmail,
        subject: `BISILE contact form: ${subject}`,
        html: adminHtml,
        text: `New BISILE contact form message from ${name} (${customerEmail}).`,
        type: 'contact_form_admin',
        replyTo: customerEmail,
        metadata: { contactId: message._id },
      });
    }

    if (customerEmail) {
      const customerHtml = createBisileEmailHtml({
        title: 'Thanks for contacting BISILE',
        intro: `Hello ${name}, thank you for reaching out to BISILE.`,
        body: `<p>We have received your message and will be in touch shortly.</p><p><strong>Your message:</strong><br />${escapeHtml(String(req.body.message || '')).replace(/\n/g, '<br />')}</p>`,
        footer: 'BISILE customer care',
      });
      await sendTransactionalEmail({
        to: customerEmail,
        subject: 'We received your BISILE message',
        html: customerHtml,
        text: 'We received your BISILE message and will be in touch shortly.',
        type: 'contact_form_customer',
        metadata: { contactId: message._id },
      });
    }
  } catch (error) {
    console.error('Contact form email failed', { error: error instanceof Error ? error.message : error });
  }

  res.status(201).json({ message });
}));
publicRoutes.post('/newsletter/subscribe', validate(newsletterSchema), asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').toLowerCase();
  await NewsletterSubscriber.updateOne({ email }, { $set: { status: 'active', source: req.body.source }, $setOnInsert: { subscribedAt: new Date() } }, { upsert: true });
  res.json({ ok: true });
}));
publicRoutes.post('/reviews', validate(reviewSchema), asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.body.productId)) return res.status(400).json({ error: 'Invalid product ID' });
  if (req.body.customerId && !isValidObjectId(req.body.customerId)) return res.status(400).json({ error: 'Invalid customer ID' });
  return res.status(201).json({ review: await Review.create({ ...req.body, status: 'pending' }) });
}));
publicRoutes.get('/products/:productId/reviews', asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.productId)) return res.status(400).json({ error: 'Invalid product ID' });
  return res.json({ reviews: await Review.find({ productId: req.params.productId, status: 'approved' }).lean() });
}));
