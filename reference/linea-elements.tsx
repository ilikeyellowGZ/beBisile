import React from 'react';

const products = [
  { name: 'Pantheon', category: 'Earrings', price: '€2,850', image: '/assets/pantheon-ChbEbbTu.jpg' },
  { name: 'Eclipse', category: 'Bracelets', price: '€3,200', image: '/assets/eclipse-ErA5xE4T.jpg' },
  { name: 'Halo', category: 'Earrings', price: '€1,950', image: '/assets/halo-CMlMG7vQ.jpg' },
  { name: 'Oblique', category: 'Earrings', price: '€1,650', image: '/assets/oblique-BrLAWbgb.jpg' },
];

const filterGroups = [
  { title: 'Category', options: ['Earrings', 'Bracelets', 'Rings', 'Necklaces'] },
  { title: 'Price', options: ['Under €1,000', '€1,000 - €2,000', '€2,000 - €3,000', 'Over €3,000'] },
  { title: 'Material', options: ['Gold', 'Silver', 'Rose Gold', 'Platinum'] },
];

export const LineaNavElement: React.FC = () => (
  <header className="sticky top-0 z-50 grid h-14 grid-cols-[1fr_auto_1fr] items-center bg-white px-6 text-sm font-light text-[#333]">
    <nav className="flex gap-7">
      <a href="#">Shop</a>
      <a href="#">New in</a>
      <a href="#">About</a>
    </nav>
    <a href="#" className="text-3xl font-light tracking-[0.03em]">LINEA</a>
    <div className="flex justify-end gap-7">
      <span>Search</span>
      <span>Wishlist</span>
      <span>Bag</span>
    </div>
  </header>
);

export const LineaFeatureGridElement: React.FC = () => (
  <section className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-2">
    <article>
      <a href="#" className="mb-3 block aspect-square overflow-hidden bg-[#f5f5f5]">
        <img src="/assets/earrings-collection-6O5tp3RC.png" alt="Earrings collection" className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
      </a>
      <h3 className="mb-1 text-sm font-normal text-[#171717]">Organic Forms</h3>
      <p className="text-sm font-light text-[#171717]">Nature-inspired pieces with fluid, sculptural details</p>
    </article>
    <article>
      <a href="#" className="mb-3 block aspect-square overflow-hidden bg-[#f5f5f5]">
        <img src="/assets/link-bracelet-CMFM2KKw.png" alt="Chain link bracelet" className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
      </a>
      <h3 className="mb-1 text-sm font-normal text-[#171717]">Chain Collection</h3>
      <p className="text-sm font-light text-[#171717]">Refined links and connections in precious metals</p>
    </article>
  </section>
);

export const LineaProductGridElement: React.FC = () => (
  <section className="grid grid-cols-1 gap-6 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
    {products.map((product) => (
      <article key={product.name}>
        <a href="#" className="mb-3 block aspect-square overflow-hidden bg-[#f5f5f5]">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
        </a>
        <div className="grid gap-1 text-sm">
          <span className="font-light text-[#737373]">{product.category}</span>
          <div className="flex justify-between gap-4">
            <strong className="font-normal">{product.name}</strong>
            <span>{product.price}</span>
          </div>
        </div>
      </article>
    ))}
  </section>
);

export const LineaCategoryToolbarElement: React.FC = () => (
  <section className="border-b border-[#e5e5e5] px-6 py-8">
    <div className="flex gap-3 text-sm font-light text-[#737373]">
      <span>Home</span>
      <span>›</span>
      <strong className="font-normal text-[#171717]">Necklaces</strong>
    </div>
    <h1 className="my-8 text-4xl font-light leading-tight">Necklaces</h1>
    <div className="flex items-center justify-between">
      <p className="text-sm font-light text-[#737373]">24 items</p>
      <div className="flex gap-10 text-sm font-light">
        <button>Filters</button>
        <button>Featured⌄</button>
      </div>
    </div>
  </section>
);

export const LineaFilterDrawerElement: React.FC = () => (
  <aside className="ml-auto w-full max-w-sm border-l border-[#e5e5e5] bg-white p-6">
    <h2 className="mb-5 text-sm font-normal">Filters</h2>
    {filterGroups.map((group) => (
      <div key={group.title} className="border-t border-[#e5e5e5] py-6">
        <h3 className="mb-4 text-sm font-normal">{group.title}</h3>
        <div className="grid gap-3">
          {group.options.map((option) => (
            <label key={option} className="flex items-center gap-3 text-sm font-light">
              <span className="h-[15px] w-[15px] border border-[#e5e5e5]" />
              {option}
            </label>
          ))}
        </div>
      </div>
    ))}
  </aside>
);

export const LineaStoryElement: React.FC = () => (
  <section className="grid items-center gap-12 px-6 py-24 md:grid-cols-[1fr_1.1fr]">
    <div>
      <h2 className="mb-6 text-3xl font-light">Jewelry Drawn From Shadows and Lines</h2>
      <p className="text-sm font-light leading-relaxed text-[#171717]">Linea was born from the meeting of two minds who saw beauty not just in extension of space, light, and line.</p>
      <p className="mt-6 text-sm font-light">Read our full story →</p>
    </div>
    <div className="aspect-[16/7] overflow-hidden bg-[#f5f5f5]">
      <img src="/assets/founders-ioSVwXFB.png" alt="Company founders" className="h-full w-full object-cover" />
    </div>
  </section>
);

export const LineaFooterElement: React.FC = () => (
  <footer className="mt-48 border-t border-[#e5e5e5] bg-white px-6 pb-2 pt-8 text-black">
    <div className="grid gap-12 lg:grid-cols-2">
      <div>
        <h2 className="mb-4 text-2xl font-light">Linea Jewelry Inc.</h2>
        <p className="mb-6 max-w-md text-sm font-light leading-relaxed text-black/70">Minimalist jewelry crafted for the modern individual</p>
        <h4 className="mb-1 text-sm font-normal">Visit Us</h4>
        <p className="text-sm font-light leading-relaxed text-black/70">123 Madison Avenue<br />New York, NY 10016</p>
      </div>
      <div className="grid gap-8 sm:grid-cols-3">
        <FooterColumn title="Shop" items={['New In', 'Rings', 'Earrings', 'Bracelets', 'Necklaces']} />
        <FooterColumn title="Support" items={['Size Guide', 'Care Instructions', 'Returns', 'Shipping', 'Contact']} />
        <FooterColumn title="Connect" items={['Instagram', 'Pinterest', 'Newsletter']} />
      </div>
    </div>
  </footer>
);

const FooterColumn: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <div>
    <h4 className="mb-5 text-sm font-normal">{title}</h4>
    <ul className="grid gap-3 text-sm font-light text-black/70">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  </div>
);
