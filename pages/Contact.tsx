import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import { CONTACT_EMAIL, CONTACT_PHONE, ORDER_EMAIL, getWhatsAppUrl } from '../constants';
import { apiUrl, readJsonResponse } from '../utils/http';

const contactApiUrl = apiUrl('/api/contact');

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submitContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(contactApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.get('fullName'),
          email: form.get('email'),
          subject: form.get('subject') || 'Website enquiry',
          message: form.get('message'),
        }),
      });
      await readJsonResponse(response, 'Unable to send your message.');
      setSubmitted(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to send your message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary px-6 pb-24 pt-32 md:px-12">
      <div className="mx-auto max-w-[1260px]">
        <p className="mb-3 font-sans text-[10px] uppercase tracking-[0.22em] text-accent">Customer care</p>
        <h1 className="font-serif text-6xl md:text-8xl">Let us help.</h1>
        <p className="mt-5 max-w-lg font-sans text-sm leading-7 text-primary/60">Questions, order concerns, gifting advice, delivery quotes, or product guidance. Choose the easiest way to reach us.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
          <div className="bisile-card-surface flex flex-col justify-between p-8">
            <div>
              <MessageCircle className="mb-5 text-accent" strokeWidth={1.2} />
              <h2 className="font-serif text-5xl">WhatsApp help.</h2>
              <p className="mt-5 font-sans text-sm leading-7 text-primary/60">For product guidance and order concerns, start a direct conversation with the BISILE team.</p>
              <div className="mt-6 space-y-2 font-sans text-xs text-primary/60">
                <p>{CONTACT_PHONE}</p>
                <p>{CONTACT_EMAIL}</p>
                <p>{ORDER_EMAIL}</p>
              </div>
            </div>
            <a href={getWhatsAppUrl('Hello BISILE, I need assistance with an order or product concern.')} target="_blank" rel="noreferrer" className="mt-8 flex items-center justify-between border-t border-[#B9AA8B]/36 pt-5 font-sans text-[10px] uppercase tracking-[0.18em] hover:text-accent">
              Start a chat <ArrowRight size={14} />
            </a>
          </div>

          <div className="bisile-card-surface p-8">
            {submitted ? (
              <div className="flex min-h-[360px] flex-col justify-center">
                <CheckCircle2 className="mb-4 text-accent" />
                <h2 className="font-subhead text-3xl">Your note has been received.</h2>
              </div>
            ) : (
              <form onSubmit={submitContact} className="grid gap-4 sm:grid-cols-2">
                <h2 className="font-subhead text-3xl sm:col-span-2">Contact us</h2>
                <input required name="fullName" placeholder="Full name" className="field-light px-4 py-4 text-xs" />
                <input required name="email" type="email" placeholder="Email address" className="field-light px-4 py-4 text-xs" />
                <input name="subject" placeholder="Order number or subject (optional)" className="field-light px-4 py-4 text-xs sm:col-span-2" />
                <textarea required name="message" rows={6} placeholder="How can we help?" className="field-light px-4 py-4 text-xs sm:col-span-2" />
                {error && <p className="border border-red-300 bg-red-50 px-4 py-3 text-xs leading-6 text-red-800 sm:col-span-2">{error}</p>}
                <button disabled={isSubmitting} className="flex items-center justify-between bg-[#5B3A24] px-5 py-4 font-sans text-[10px] uppercase tracking-[0.18em] text-[#F7F4EF] hover:bg-accent disabled:opacity-60 sm:col-span-2">
                  {isSubmitting ? 'Sending...' : 'Send message'} <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
