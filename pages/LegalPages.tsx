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

const lastUpdated = '11 July 2026';

const contactLine = `Questions about these terms can be sent to ${CONTACT_EMAIL} or ${CONTACT_PHONE}.`;
const policyContactLine = `For questions about refunds, returns, shipping, or your order, contact BISILE customer support at ${CONTACT_EMAIL} or ${CONTACT_PHONE}. We aim to respond within 1 to 2 business days.`;

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
    body: 'Refund, return, exchange, and delivery rules are set out in the Refund, Return & Shipping Policy. That policy forms part of these Terms and Conditions.',
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
    title: 'Refund, return, and shipping policy',
    body: 'At BISILE, we are committed to delivering luxury products of exceptional quality. Because our products include fragrance, hair, beauty, and personal-care items, we maintain strict hygiene and quality standards.',
  },
  {
    title: 'Returns',
    body: 'Returns are accepted only where the product is incorrect, damaged, defective, or has a manufacturing defect.',
    items: [
      'You must contact BISILE within 48 hours of receiving your order.',
      'The item must be unused, unopened where sealed, and in its original packaging.',
      'Proof of purchase and clear photographs of the product and packaging must be provided.',
      'Products returned without prior approval will not be accepted.',
    ],
  },
  {
    title: 'Non-returnable items',
    body: 'For hygiene and safety reasons, BISILE cannot accept returns or exchanges on the following items unless they are defective, damaged, or incorrectly supplied.',
    items: [
      'Used fragrances.',
      'Used hair products, wigs, bundles, closures, frontals, or lace products.',
      'Used beauty or personal-care products.',
      'Customised or personalised items.',
      'Gift cards.',
      'Sale or promotional items.',
    ],
  },
  {
    title: 'Refunds',
    items: [
      'Once your approved return has been received and inspected, BISILE will notify you of the outcome.',
      'If approved, your refund will be processed to your original payment method within 5 to 10 business days.',
      'Shipping fees are non-refundable unless the return is due to an error made by BISILE.',
      'If your return is declined because it does not meet the policy requirements, the product will be returned to you.',
    ],
  },
  {
    title: 'Exchanges',
    body: 'BISILE only replaces products that are defective, damaged, or incorrectly supplied, subject to inspection and approval.',
  },
  {
    title: 'Order processing',
    items: [
      'Orders are processed within 1 to 3 business days after payment has been confirmed.',
      'Custom orders are processed within 14 to 21 business days after payment has been confirmed, unless a different timeline is agreed in writing.',
      'Processing times may be longer during product launches, promotions, public holidays, or periods of high order volume.',
    ],
  },
  {
    title: 'Delivery time',
    items: [
      'Major South African cities: estimated delivery within 2 to 5 business days after dispatch.',
      'Regional and outlying areas: estimated delivery within 3 to 7 business days after dispatch.',
      'Delivery times are estimates and may vary depending on the courier, destination, public holidays, service interruptions, and circumstances outside BISILE control.',
    ],
  },
  {
    title: 'Shipping costs and delivery options',
    body: 'Shipping costs are calculated or confirmed at checkout based on your delivery address, selected delivery method, and order size. Any free-shipping promotion will be clearly communicated on the website or BISILE social media platforms.',
    items: DELIVERY_OPTIONS.map((option) => `${option.name}: ${option.price}`),
  },
  {
    title: 'Order tracking',
    body: 'Once your order has been dispatched, you will receive a tracking number or delivery update by email or WhatsApp so you can monitor your delivery.',
  },
  {
    title: 'Delivery responsibility',
    body: 'Please ensure that your delivery address and contact details are accurate before placing your order.',
    items: [
      'BISILE cannot be held responsible for delays or failed deliveries caused by incorrect delivery information.',
      'BISILE cannot be held responsible for customer unavailability or failed collection.',
      'BISILE cannot be held responsible for courier delays beyond our control.',
      'BISILE cannot be held responsible for severe weather, public disruptions, or unforeseen circumstances.',
      'If a parcel is returned because of incorrect details, failed collection, or failed delivery attempts, the customer may be responsible for the new delivery fee.',
    ],
  },
  {
    title: 'Damaged or incorrect orders',
    body: 'If your order arrives damaged, defective, or incorrect, please contact BISILE within 48 hours of delivery so the issue can be reviewed quickly.',
    items: [
      'Include your order number.',
      'Include clear photographs of the product and packaging.',
      'Include a brief description of the issue.',
      'After assessment, BISILE may offer a replacement, repair, exchange, store credit, or refund depending on the issue and product type.',
    ],
  },
  {
    title: 'Contact',
    body: policyContactLine,
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
    title: 'Refund, Return & Shipping Policy',
    body: 'The Refund, Return & Shipping Policy explains delivery options, processing timelines, return eligibility, non-returnable items, defective item reporting, exchanges, and refund processing.',
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
    title: 'Refund, Return & Shipping Policy',
    intro: 'Return eligibility, non-returnable items, refund timelines, exchanges, delivery options, shipping costs, order tracking, and damaged-item reporting for BISILE orders.',
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
  { label: 'Refund, Return & Shipping Policy', to: '/refund-and-shipping-policy' },
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
