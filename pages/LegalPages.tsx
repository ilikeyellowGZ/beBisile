import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CONTACT_EMAIL, CONTACT_PHONE, DELIVERY_OPTIONS, LAYBYE_TERMS } from '../constants';

type LegalSection = {
  title: string;
  body?: string;
  items?: string[];
};

type LegalPageConfig = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
};

const lastUpdated = '7 July 2026';

const contactLine = `Questions about these terms can be sent to ${CONTACT_EMAIL} or ${CONTACT_PHONE}.`;

const termsSections: LegalSection[] = [
  {
    title: 'Using this website',
    body: 'By browsing, ordering, or paying through the BISILE website, you agree to these Terms and Conditions. If you do not agree, please do not place an order through the website.',
  },
  {
    title: 'Products and services',
    items: [
      'BISILE sells fragrance, processed virgin hair, wigs, bundles, closures, frontals, wig laundry services, beauty rituals, and gifting items.',
      'Product colours, packaging, lace, hair textures, and scent descriptions may vary slightly because screens, lighting, and natural product finishes differ.',
      'All products and services are subject to availability. We may limit quantities, correct product information, or cancel unavailable items before dispatch.',
    ],
  },
  {
    title: 'Pricing and payment',
    items: [
      'Prices are shown in South African Rand unless stated otherwise.',
      'Website card payments are processed securely through Paystack. BISILE does not store full card details.',
      'An order is confirmed only once payment has been received, authorised, and matched to the order.',
      'If a pricing or stock error appears on the website, we may contact you to correct the order or issue a refund.',
    ],
  },
  {
    title: 'Laybye terms',
    items: LAYBYE_TERMS,
  },
  {
    title: 'Order information',
    items: [
      'Customers are responsible for providing accurate names, contact numbers, email addresses, delivery details, and shipping selections.',
      'Delivery delays caused by incorrect or incomplete customer information are the customer\'s responsibility.',
      'BISILE may contact you by email, phone, or WhatsApp to confirm order, payment, collection, or delivery details.',
    ],
  },
  {
    title: 'Returns, refunds, and delivery',
    body: 'Refund, return, exchange, and delivery rules are set out in the Refund & Shipping Policy. That policy forms part of these Terms and Conditions.',
  },
  {
    title: 'Intellectual property',
    body: 'BISILE brand names, images, product copy, layouts, graphics, and website content belong to BISILE or are used with permission. They may not be copied, resold, reproduced, or used for another business without written consent.',
  },
  {
    title: 'Contact',
    body: contactLine,
  },
];

const privacySections: LegalSection[] = [
  {
    title: 'Information we collect',
    items: [
      'Contact information such as your name, email address, phone number, and WhatsApp details.',
      'Order and delivery information such as products selected, delivery method, address, payment status, and order notes.',
      'Website information such as pages viewed, device/browser details, and messages submitted through forms.',
    ],
  },
  {
    title: 'How we use information',
    items: [
      'To process orders, payments, deliveries, refunds, exchanges, and customer care requests.',
      'To send order updates, payment confirmations, delivery communication, and support replies.',
      'To improve the website, product offering, fraud prevention, security, and customer experience.',
      'To send marketing messages only where allowed or requested. You may ask us to stop sending marketing communication.',
    ],
  },
  {
    title: 'Payments',
    body: 'Card payments are processed by Paystack. BISILE receives transaction status and order information needed to complete your purchase, but we do not store full card numbers or card security codes.',
  },
  {
    title: 'Sharing information',
    items: [
      'We share information only where needed with payment providers, delivery partners, hosting providers, database providers, communication tools, and service providers who help us run the store.',
      'We may share information where required by law, fraud prevention, chargeback investigation, payment verification, or a lawful request.',
      'We do not sell customer personal information.',
    ],
  },
  {
    title: 'Protection of personal information',
    body: 'We take reasonable steps to protect customer information and handle it in line with applicable South African privacy requirements, including POPIA where it applies.',
  },
  {
    title: 'Your rights',
    body: `You may ask to access, correct, or delete your personal information where the law allows. Contact ${CONTACT_EMAIL} for privacy requests.`,
  },
  {
    title: 'Contact',
    body: contactLine,
  },
];

const refundShippingSections: LegalSection[] = [
  {
    title: 'Shipping areas and delivery methods',
    body: 'BISILE ships within South Africa using the delivery methods selected or confirmed during checkout.',
  },
  {
    title: 'Delivery options',
    items: DELIVERY_OPTIONS.map((option) => `${option.name}: ${option.price}`),
  },
  {
    title: 'Processing and delivery timing',
    items: [
      'Orders are usually processed after payment has cleared and order details have been confirmed.',
      'In-stock product orders are normally prepared within 1 to 3 business days.',
      'Estimated delivery after dispatch is usually 2 to 7 business days, depending on the delivery method, address, courier workload, public holidays, and service interruptions.',
      'Custom, made-to-order, pre-order, wig laundry, or special service orders may take longer. We will communicate timelines directly where required.',
    ],
  },
  {
    title: 'Shipping responsibility',
    items: [
      'Customers must provide correct delivery details and be available to receive or collect parcels.',
      'Risk passes to the customer once the parcel is delivered, collected, or marked as delivered by the courier or delivery partner.',
      'If a parcel is returned because of incorrect details, failed collection, or failed delivery attempts, the customer may be responsible for the new delivery fee.',
    ],
  },
  {
    title: 'Refunds and returns',
    items: [
      'Refund or exchange requests must be reported within 7 days of receiving the order, unless a shorter product-specific notice period applies below.',
      'Items must be unused, unworn, unopened where sealed, in original packaging, and in resellable condition.',
      'Fragrance, beauty, and personal care products cannot be returned once opened, used, sprayed, or unsealed, unless defective.',
      'Hair, wigs, closures, frontals, bundles, and lace products cannot be returned after being worn, washed, cut, installed, brushed out, coloured, altered, or customised.',
      'Wig laundry and beauty services cannot be refunded once the service has started or been completed, unless BISILE agrees there was a service fault.',
      'Delivery fees are not refundable unless the return is caused by a confirmed BISILE error or defective item.',
    ],
  },
  {
    title: 'Damaged, defective, or incorrect items',
    items: [
      'Please report damaged, defective, or incorrect items within 48 hours of delivery.',
      'Send your order number, photos or video of the issue, packaging photos, and a clear description to BISILE customer care.',
      'After assessment, BISILE may offer a replacement, repair, exchange, store credit, or refund depending on the issue and product type.',
    ],
  },
  {
    title: 'How refunds are paid',
    body: 'Approved refunds are paid back through the original payment method where possible. Processing time depends on Paystack, the customer bank, and any verification required for the transaction.',
  },
  {
    title: 'Contact',
    body: contactLine,
  },
];

const policiesSections: LegalSection[] = [
  {
    title: 'Terms and Conditions',
    body: 'The Terms and Conditions explain website use, order rules, payment confirmation, laybye rules, product availability, and customer responsibilities.',
  },
  {
    title: 'Privacy Policy',
    body: 'The Privacy Policy explains what customer information BISILE collects, how it is used, how Paystack payment information is handled, and how privacy requests can be made.',
  },
  {
    title: 'Refund & Shipping Policy',
    body: 'The Refund & Shipping Policy explains delivery options, processing timelines, return eligibility, defective item reporting, and refund processing.',
  },
  {
    title: 'Payment provider verification',
    body: 'Where a payment provider requires business verification documents, BISILE provides official documents such as bank confirmation letters directly to the payment provider through the requested secure channel.',
  },
  {
    title: 'Customer care',
    body: contactLine,
  },
];

const pages: Record<string, LegalPageConfig> = {
  terms: {
    eyebrow: 'Legal',
    title: 'Terms & Conditions',
    intro: 'The conditions for using the BISILE website, placing orders, paying securely, and receiving BISILE products or services.',
    sections: termsSections,
  },
  privacy: {
    eyebrow: 'Privacy',
    title: 'Privacy Policy',
    intro: 'How BISILE collects, uses, protects, and shares customer information for orders, payments, delivery, and customer care.',
    sections: privacySections,
  },
  refundShipping: {
    eyebrow: 'Customer care',
    title: 'Refund & Shipping Policy',
    intro: 'Delivery options, processing timelines, return rules, refund eligibility, and damaged-item reporting for BISILE orders.',
    sections: refundShippingSections,
  },
  policies: {
    eyebrow: 'Policies',
    title: 'Policies',
    intro: 'A central overview of BISILE customer, payment, delivery, refund, privacy, and verification policies.',
    sections: policiesSections,
  },
};

const policyLinks = [
  { label: 'Terms & Conditions', to: '/terms-and-conditions' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Refund & Shipping Policy', to: '/refund-and-shipping-policy' },
  { label: 'Policies', to: '/policies' },
];

const LegalPage: React.FC<{ config: LegalPageConfig }> = ({ config }) => (
  <div className="bg-off-white pt-16 text-primary">
    <section className="bisile-shell border-b border-[#A3915D]/24 py-16 md:py-24">
      <p className="bisile-kicker mb-4">{config.eyebrow}</p>
      <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
        <h1 className="font-serif text-5xl font-light leading-none md:text-7xl">{config.title}</h1>
        <div>
          <p className="max-w-2xl font-inter text-sm font-light leading-7 text-primary/64 md:text-base md:leading-8">{config.intro}</p>
          <p className="mt-5 font-inter text-xs font-light uppercase tracking-[0.16em] text-primary/45">Last updated: {lastUpdated}</p>
        </div>
      </div>
    </section>

    <section className="bisile-shell py-10 md:py-16">
      <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-[#A3915D]/28 bg-[#F7F4EF]/74 p-5">
            <p className="mb-4 font-inter text-[10px] font-light uppercase tracking-[0.18em] text-accent">Review pages</p>
            <nav className="space-y-3" aria-label="Legal pages">
              {policyLinks.map((link) => (
                <Link key={link.to} to={link.to} className="flex items-center justify-between gap-4 border-t border-[#A3915D]/18 pt-3 font-inter text-sm font-light text-primary/68 transition-colors hover:text-accent">
                  {link.label}
                  <ArrowRight size={13} strokeWidth={1.2} />
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <div className="divide-y divide-[#A3915D]/24 border-y border-[#A3915D]/24">
          {config.sections.map((section) => (
            <section key={section.title} className="grid gap-5 py-8 md:grid-cols-[240px_minmax(0,1fr)] md:gap-10 md:py-10">
              <h2 className="font-inter text-xl font-light leading-tight md:text-2xl">{section.title}</h2>
              <div className="font-inter text-sm font-light leading-7 text-primary/66">
                {section.body && <p>{section.body}</p>}
                {section.items && (
                  <ul className="space-y-3">
                    {section.items.map((item) => (
                      <li key={item} className="border-l border-[#A3915D]/30 pl-4">{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export const TermsAndConditions: React.FC = () => <LegalPage config={pages.terms} />;
export const PrivacyPolicy: React.FC = () => <LegalPage config={pages.privacy} />;
export const RefundAndShippingPolicy: React.FC = () => <LegalPage config={pages.refundShipping} />;
export const Policies: React.FC = () => <LegalPage config={pages.policies} />;
