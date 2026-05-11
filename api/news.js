export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // 2026年5月最新資料（每月更新）
  const items = [
    {
      tag: '新品',
      title: 'No.16 日本交通計程車',
      desc: '日本交通計程車造型，附懸吊功能，售價594日圓。',
      date: '2026.05',
      series: '一般系列'
    },
    {
      tag: '新品',
      title: 'No.89 Toyota GR Yaris',
      desc: 'Toyota GR Yaris 跑車款，附懸吊功能，售價594日圓。',
      date: '2026.05',
      series: '一般系列'
    },
    {
      tag: '聯名',
      title: 'Dream Tomica No.155 いないいないばあっ！ 汪汪車',
      desc: 'NHK E頻道幼兒節目《躲貓貓》的人氣角色「汪汪」登場！',
      date: '2026.05',
      series: 'Dream Tomica'
    },
    {
      tag: '聯名',
      title: 'TOMICA TUNES 三麗鷗角色 Vol.2',
      desc: 'Hello Kitty、布丁狗、肉桂狗等6種三麗鷗角色，薄荷巧克力配色，售價1,320日圓。',
      date: '2026.05',
      series: 'Tomica Tunes'
    },
    {
      tag: '聯名',
      title: 'Dream Tomica No.173 迪士尼小熊維尼',
      desc: '迪士尼摩托斯系列，附小熊維尼人偶，售價1,100日圓。',
      date: '2026.05',
      series: 'Disney Tomica'
    },
    {
      tag: '聯名',
      title: 'Dream Tomica No.174 迪士尼熊抱哥',
      desc: '迪士尼摩托斯清潔車款，附熊抱哥人偶，售價1,100日圓。',
      date: '2026.05',
      series: 'Disney Tomica'
    },
    {
      tag: '新品',
      title: 'Tomica Premium No.21 Mercedes-Benz 190E 2.5-16 Evo II',
      desc: '經典賽車款登場，附懸吊＆雙門開閉功能，1/62比例，售價990日圓。',
      date: '2026.05',
      series: 'Tomica Premium'
    },
    {
      tag: '聯名',
      title: 'Tomica Premium Unlimited 星際大戰 Razor Crest',
      desc: '《曼達洛人》Razor Crest飛船模型，附展示台，售價1,430日圓。',
      date: '2026.05',
      series: 'Tomica Premium Unlimited'
    },
    {
      tag: '聯名',
      title: 'Tomica Premium Unlimited 玩命關頭 金屬色2款組合',
      desc: '《玩命關頭》人氣車輛金屬配色版本，2台套組，售價2,640日圓。',
      date: '2026.05',
      series: 'Tomica Premium Unlimited'
    },
    {
      tag: '限定',
      title: 'AEON限定 No.86 Toyota Corolla 德國警察塗裝',
      desc: '全國AEON限定款，Toyota Corolla 德國警察車塗裝，售價880日圓。',
      date: '2026.05.23',
      series: '販售店限定'
    }
  ];

  res.setHeader('Cache-Control', 's-maxage=86400');
  return res.status(200).json({ items, updatedAt: Date.now() });
}
