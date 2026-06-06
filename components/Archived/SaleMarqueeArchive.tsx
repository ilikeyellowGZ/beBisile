import React from 'react';

const renderMarqueeWords = (row: string, word: string) =>
  Array.from({ length: 12 }, (_, index) => (
    <span key={`${row}-${index}`}>{word}</span>
  ));

export const SaleMarqueeArchive: React.FC = () => (
  <div className="bisile-sale-stack" aria-label="Sale promotion">
    <div className="bisile-sale-marquee bisile-sale-marquee--urgent">
      <div className="bisile-sale-marquee__track bisile-sale-marquee__track--reverse">
        <div className="bisile-sale-marquee__row">{renderMarqueeWords('urgent-sale-a', 'URGENT SALE')}</div>
        <div className="bisile-sale-marquee__row" aria-hidden="true">{renderMarqueeWords('urgent-sale-b', 'URGENT SALE')}</div>
      </div>
    </div>
    <div className="bisile-sale-marquee">
      <div className="bisile-sale-marquee__track">
        <div className="bisile-sale-marquee__row">{renderMarqueeWords('sale-a', 'SALE')}</div>
        <div className="bisile-sale-marquee__row" aria-hidden="true">{renderMarqueeWords('sale-b', 'SALE')}</div>
      </div>
    </div>
  </div>
);

export default SaleMarqueeArchive;
