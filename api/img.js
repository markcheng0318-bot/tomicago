export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.startsWith('https://www.takaratomy.co.jp/')) {
    return res.status(400).end();
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://www.takaratomy.co.jp/products/tomica/',
        'Origin': 'https://www.takaratomy.co.jp',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'ja-JP,ja;q=0.9',
      }
    });

    if (!response.ok) {
      return res.status(response.status).end();
    }

    const contentType = response.headers.get('content-type') || 'image/webp';
    if (!contentType.includes('image')) {
      return res.status(404).end();
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength < 500) {
      return res.status(404).end();
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=604800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.send(Buffer.from(buffer));

  } catch(e) {
    res.status(500).end();
  }
}
