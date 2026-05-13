export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.startsWith('https://www.takaratomy.co.jp/')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://www.takaratomy.co.jp/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      }
    });

    if (!response.ok) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const contentType = response.headers.get('content-type') || 'image/webp';
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=604800'); // 快取7天
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(buffer));

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
