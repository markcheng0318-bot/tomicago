export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const allItems = [];

  res.setHeader('Cache-Control', 's-maxage=86400');
  return res.status(200).json({ items: allItems, updatedAt: 1778648098580 });
}
