import { Router } from 'express';
import { Category, ContactMessage, NewsletterSubscriber, Product, Review, StoreSettings } from '../models/index.js';
import { createBisileEmailHtml, sendTransactionalEmail } from '../services/email.service.js';

export const publicRoutes = Router();

publicRoutes.get('/products', async (_req, res) => res.json({ products: await Product.find({ isActive: true, isArchived: false }).sort({ isFeatured: -1, createdAt: -1 }) }));
publicRoutes.get('/products/:slug', async (req, res) => res.json({ product: await Product.findOne({ slug: req.params.slug, isActive: true, isArchived: false }) }));
publicRoutes.get('/categories', async (_req, res) => res.json({ categories: await Category.find({ isActive: true }).sort({ name: 1 }) }));
publicRoutes.post('/contact', async (req, res) => {
  const message = await ContactMessage.create({ ...req.body, status: 'new' });
  try {
    const settings = await StoreSettings.findOne().lean();
    const adminEmail = String(settings?.storeEmail || '').trim();
    const customerEmail = String(req.body.email || '').trim();
    const name = String(req.body.fullName || 'Customer').trim();
    const subject = String(req.body.subject || 'New BISILE enquiry').trim();

    if (adminEmail) {
      const adminHtml = createBisileEmailHtml({
        title: 'New BISILE contact message',
        intro: 'A customer submitted a message through the BISILE contact form.',
        body: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${customerEmail}</p><p><strong>Subject:</strong> ${subject}</p><p><strong>Message:</strong><br />${String(req.body.message || '').replace(/\n/g, '<br />')}</p>`,
        footer: 'This message was sent from the public BISILE contact form.',
      });
      await sendTransactionalEmail({
        to: adminEmail,
        subject: `BISILE contact form: ${subject}`,
        html: adminHtml,
        text: `New BISILE contact form message from ${name} (${customerEmail}).`,
        type: 'contact_form_admin',
        metadata: { contactId: message._id },
      });
    }

    if (customerEmail) {
      const customerHtml = createBisileEmailHtml({
        title: 'Thanks for contacting BISILE',
        intro: `Hello ${name}, thank you for reaching out to BISILE.`,
        body: `<p>We have received your message and will be in touch shortly.</p><p><strong>Your message:</strong><br />${String(req.body.message || '').replace(/\n/g, '<br />')}</p>`,
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
});
publicRoutes.post('/newsletter/subscribe', async (req, res) => {
  const email = String(req.body.email || '').toLowerCase();
  await NewsletterSubscriber.updateOne({ email }, { $set: { status: 'active', source: req.body.source }, $setOnInsert: { subscribedAt: new Date() } }, { upsert: true });
  res.json({ ok: true });
});
publicRoutes.post('/reviews', async (req, res) => res.status(201).json({ review: await Review.create({ ...req.body, status: 'pending' }) }));
publicRoutes.get('/products/:productId/reviews', async (req, res) => res.json({ reviews: await Review.find({ productId: req.params.productId, status: 'approved' }) }));
