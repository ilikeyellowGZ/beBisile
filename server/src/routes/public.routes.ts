import { Router } from 'express';
import { Category, ContactMessage, NewsletterSubscriber, Product, Review } from '../models/index.js';

export const publicRoutes = Router();

publicRoutes.get('/products', async (_req, res) => res.json({ products: await Product.find({ isActive: true, isArchived: false }).sort({ isFeatured: -1, createdAt: -1 }) }));
publicRoutes.get('/products/:slug', async (req, res) => res.json({ product: await Product.findOne({ slug: req.params.slug, isActive: true, isArchived: false }) }));
publicRoutes.get('/categories', async (_req, res) => res.json({ categories: await Category.find({ isActive: true }).sort({ name: 1 }) }));
publicRoutes.post('/contact', async (req, res) => res.status(201).json({ message: await ContactMessage.create({ ...req.body, status: 'new' }) }));
publicRoutes.post('/newsletter/subscribe', async (req, res) => {
  const email = String(req.body.email || '').toLowerCase();
  await NewsletterSubscriber.updateOne({ email }, { $set: { status: 'active', source: req.body.source }, $setOnInsert: { subscribedAt: new Date() } }, { upsert: true });
  res.json({ ok: true });
});
publicRoutes.post('/reviews', async (req, res) => res.status(201).json({ review: await Review.create({ ...req.body, status: 'pending' }) }));
publicRoutes.get('/products/:productId/reviews', async (req, res) => res.json({ reviews: await Review.find({ productId: req.params.productId, status: 'approved' }) }));
