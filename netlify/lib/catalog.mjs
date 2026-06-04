export const catalog = {
  indoniyamanzi: { name: 'Indoniyamanzi', price: 499.99 },
  inkanyezi: { name: 'Inkanyezi', price: 499.99 },
  sithelo: { name: 'Sithelo', price: 649.99 },
  langelihle: { name: 'Langelihle', price: 629.99 },
  ndalwenhle: { name: 'Ndalwenhle', price: 529.99 },
  luyanda: { name: 'Luyanda', price: 689.99 },
  mvelwenhle: { name: 'Mvelwenhle', price: 2489.99 },
  thabitha: { name: 'Thabitha', price: 2649.99 },
  nokhwezi: { name: 'Nokhwezi', price: 2799.99 },
  khwezilokusa: { name: 'Khwezilokusa', price: 2799.99 },
  nobuntu: { name: 'Nobuntu', price: 2949.99 },
  melokuhle: { name: 'Melokuhle', price: 3549.99 },
  ntando: { name: 'Ntando', price: 3749.99 },
  ayabonga: { name: 'Ayabonga', price: 3449.99 },
  ayanda: { name: 'Ayanda', price: 3799.99 },
  bonginhlanhla: { name: 'Bonginhlanhla', price: 3789.99 },
  nobuhle: { name: 'Nobuhle', price: 3949.99 },
  masindi: { name: 'Masindi', price: 4649.99 },
  buhlebendalo: { name: 'Buhlebendalo', price: 4549.99 },
  thabisile: { name: 'Thabisile', price: 4249.99 },
  'ntombi-zandile': { name: 'Ntombi Zandile', price: 4489.99 },
  londiwe: { name: 'Londiwe', price: 4689.99 },
  samkelisiwe: { name: 'Samkelisiwe', price: 4849.99 },
  ntombizonke: { name: 'Ntombizonke', price: 4889.99 },
  'wig-wash-only': { name: 'Wig Wash Only', price: 190 },
  'wig-treatment-straighten': { name: 'Wig Treatment - Straighten', price: 200 },
  'wig-treatment-curls': { name: 'Wig Treatment - Curls', price: 250 },
  'straightening-only': { name: 'Straightening Only', price: 100 },
  'curls-activation-only': { name: 'Curls Activation Only', price: 180 },
  'frontal-plucking-only': { name: 'Frontal Plucking Only', price: 100 },
  'plucking-straightening': { name: 'Plucking and Straightening', price: 200 },
  'plucking-curl-activation': { name: 'Plucking and Curl Activation', price: 270 },
  'custom-parting': { name: 'Custom Parting', price: 100 },
  'straight-to-custom-curls': { name: 'Straight to Custom Curls', price: 320 },
  'wig-bundles-dye': { name: 'Wig / Bundles Dye', price: 300 },
  'full-laundry-straight': { name: 'Full Laundry Package - Straight', price: 390 },
  'full-laundry-curls': { name: 'Full Laundry Package - Curls', price: 420 },
  'full-laundry-custom-part': { name: 'Full Laundry Package - Custom Part', price: 590 },
};

export const resolveItems = (items) => {
  if (!Array.isArray(items) || !items.length) throw new Error('Your bag is empty.');

  return items.map(({ id, quantity }) => {
    const product = catalog[id];
    const normalizedQuantity = Number(quantity);
    if (!product || !Number.isInteger(normalizedQuantity) || normalizedQuantity < 1 || normalizedQuantity > 99) {
      throw new Error('Your bag contains an invalid item.');
    }

    return { id, name: product.name, quantity: normalizedQuantity, unitPrice: product.price };
  });
};
