export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const B = 'https://www.takaratomy.co.jp/products/tomica/new/images';

  const allItems = [
    // ── 2026年7月 ──
    { tag:'新品', title:'No.24 キャンピングカー', desc:'ドア開閉・サイドタープ設営・自転車積み下ろし機能付き。594円。', date:'2026.07', series:'一般系列', image:`${B}/2607/pic_024_01.webp` },
    { tag:'新品', title:'No.52 ミニクーパー SE カントリーマン All4', desc:'サスペンション付き。MINI正規ライセンス商品。594円。', date:'2026.07', series:'一般系列', image:`${B}/2607/pic_052_01.webp` },
    { tag:'新品', title:'スクランブルポリスステーション', desc:'電動回転駐車場・3つの出動遊び・豊富なサウンド搭載の警察署セット。9,350円。', date:'2026.07', series:'Tomica World', image:`${B}/2607/pic_tw_scramblepolicestation_01.webp` },
    { tag:'聯名', title:'TOMICA TUNES トイ・ストーリー キャラクターズ', desc:'ウッディ・バズ・ジェシーなど全7種（シークレット含む）。1,320円。', date:'2026.07', series:'Tomica Tunes', image:`${B}/2607/pic_tunes_toystory_01.webp` },
    { tag:'聯名', title:'ジョブレイバー キャリーブレイバー ハローキティ エクスプレストラック', desc:'ハローキティとジョブレイバーが合体！4,180円。', date:'2026.07', series:'Job Braver', image:`${B}/2607/pic_jr_tjbex_hellokitty_01.webp` },
    { tag:'聯名', title:'ドリームトミカ まいぜんシスターズ ぜんいち＆マイッキー', desc:'人気YouTuberぜんいちとマイッキーがトミカに登場！', date:'2026.07', series:'Dream Tomica', image:`${B}/2607/pic_dt_maizen_01.webp` },
    { tag:'聯名', title:'ドリームトミカ トミカとトム トミカだいすき', desc:'絵本「トミカとトム」シリーズ第1弾。', date:'2026.07', series:'Dream Tomica', image:`${B}/2607/pic_dt_tomicatom_01.webp` },
    { tag:'新品', title:'Tomica Premium 05 ランボルギーニ ミウラ P400S', desc:'伝説のスーパーカーがトミカプレミアムに登場。', date:'2026.07', series:'Tomica Premium', image:`${B}/2607/pic_tp_05_lamborghini_miura_01.webp` },
    { tag:'新品', title:'Tomica Premium Racing マツダ 787B', desc:'ル・マン優勝マシンがトミカプレミアムレーシングに登場！', date:'2026.07', series:'Tomica Premium Racing', image:`${B}/2607/pic_tpr_mazda_787b_01.webp` },
    { tag:'限定', title:'トミカREBORN トヨタ スープラ', desc:'トミカの歴史を彩った名車が現代に復刻。', date:'2026.07', series:'Tomica REBORN', image:`${B}/2607/pic_reborn_toyota_supra_01.webp` },

    // ── 2026年6月 ──
    { tag:'聯名', title:'ドリームトミカ レッドレディバグ搬送車セット', desc:'クレーン可動・スロープ可動・ボート連結機能付き。594円。', date:'2026.06', series:'Dream Tomica', image:`${B}/2606/pic_dt_ladybug_01.webp` },
    { tag:'新品', title:'No.132 横浜市消防局 機動けん引工作車', desc:'特別高度救助部隊の実在する特殊車両がトミカに。', date:'2026.06', series:'一般系列', image:`${B}/2606/pic_132_01.webp` },
    { tag:'聯名', title:'ドリームトミカ ディズニーパレード トイ・ストーリー５', desc:'映画公開記念！ジェシーのパレードフロート。', date:'2026.06', series:'Disney Tomica', image:`${B}/2606/pic_disney_parade_ts5_01.webp` },
    { tag:'新品', title:'Tomica Premium GT-R NISMO トランスポーター付き', desc:'GT-R NISMOとオリジナルトランスポーターのセット。', date:'2026.06', series:'Tomica Premium', image:`${B}/2606/pic_tp_transporter_gtr_01.webp` },
    { tag:'聯名', title:'Dream Tomica コンバース オールスター（全6種）', desc:'HIカット取り外し可能！ミステリーパッケージ形式。', date:'2026.06', series:'Dream Tomica', image:`${B}/2606/pic_dt_converse_01.webp` },
    { tag:'聯名', title:'Tomica Premium Unlimited トイ・ストーリー ピザ・プラネットトラック', desc:'映画の名場面を再現したトラック型トミカ。', date:'2026.06', series:'Tomica Premium Unlimited', image:`${B}/2606/pic_tpu_toystory_pizzaplanet_01.webp` },
    { tag:'聯名', title:'カーズトミカ メーター 20周年記念デザイン', desc:'カーズ20周年！メタリックカラーの特別仕様。', date:'2026.06', series:'Disney Tomica', image:`${B}/2606/pic_disney_cars_mater_20th_01.webp` },

    // ── 2026年5月 ──
    { tag:'新品', title:'No.16 日本交通計程車', desc:'日本交通計程車造型・附懸吊功能。594日圓。', date:'2026.05', series:'一般系列', image:`${B}/2605/pic_016_01.webp` },
    { tag:'新品', title:'No.89 Toyota GR Yaris', desc:'Toyota GR Yaris 跑車款・附懸吊功能。594日圓。', date:'2026.05', series:'一般系列', image:`${B}/2605/pic_089_01.webp` },
    { tag:'聯名', title:'TOMICA TUNES 三麗鷗角色 Vol.2', desc:'Hello Kitty、布丁狗等6種・薄荷巧克力配色。1,320日圓。', date:'2026.05', series:'Tomica Tunes', image:`${B}/2605/pic_tunes_sanrio_vol02_01.webp` },
    { tag:'新品', title:'Tomica Premium No.21 Mercedes-Benz 190E 2.5-16 Evo II', desc:'1/62比例・附懸吊＆雙門開閉功能。990日圓。', date:'2026.05', series:'Tomica Premium', image:`${B}/2605/pic_tp_21_mercedesbenz_190e21516_evo2_01.webp` },
    { tag:'聯名', title:'Tomica Premium Unlimited 星際大戰 Razor Crest', desc:'《曼達洛人》Razor Crest飛船・附展示台。1,430日圓。', date:'2026.05', series:'Tomica Premium Unlimited', image:`${B}/2605/pic_tpu_starwars_razorcrest_01.webp` },
    { tag:'限定', title:'AEON限定 No.86 Toyota Corolla 德國警察塗裝', desc:'全國AEON限定・5/23發售。880日圓。', date:'2026.05', series:'販売店限定', image:`${B}/2605/pic_so_aeon_01.webp` },

    // ── 2026年4月 ──
    { tag:'新品', title:'トミカビークルタウン ビッグに変形消防署', desc:'ダイキャストトミカ付きオールインワンセット。4,400円。', date:'2026.04', series:'Tomica Town', image:`${B}/2604/pic_vehicletown_fire_01.webp` },
    { tag:'限定', title:'トイザらス限定 Honda シビック TYPE R Ultimate Edition', desc:'トイザらスオリジナル特別塗装仕様。880円。4/18発売。', date:'2026.04', series:'販売店限定', image:`${B}/2604/pic_so_toysrus_civictypre_01.webp` },
    { tag:'聯名', title:'ジョブレイバー デカライドアーマー 白バイ', desc:'交通機動隊ジョブロイドと特装合体！警察ロボが完成。', date:'2026.04', series:'Job Braver', image:`${B}/2604/pic_jobraver_decaridearmor_01.webp` },

    // ── 2026年3月 ──
    { tag:'聯名', title:'TOMICA TUNES ドラえもん（全7種）', desc:'ドラえもん・ドラミ・のび太など全7種（シークレット含む）。', date:'2026.03', series:'Tomica Tunes', image:`${B}/2603/pic_tunes_doraemon_01.webp` },
    { tag:'聯名', title:'ドリームトミカ スポンジ・ボブ', desc:'リア部分に「カーニバーガー」付き！スポンジ・ボブトミカ。', date:'2026.03', series:'Dream Tomica', image:`${B}/2603/pic_dt_spongebob_01.webp` },
    { tag:'新品', title:'寿司トミカ 軍艦巻き（全6種）', desc:'サーモン・たこ・いくら・中とろなど6種。寿司皿付き！', date:'2026.03', series:'Dream Tomica', image:`${B}/2603/pic_dt_sushi_gunkan_01.webp` },
    { tag:'聯名', title:'ジョブレイバー トラフィックポリス 2体セット', desc:'トヨタ クラウン覆面パトロールカー＆ハイエース遊撃車が合体。6,600円。', date:'2026.03', series:'Job Braver', image:`${B}/2603/pic_jobraver_trafficpolice_01.webp` },

    // ── 2026年2月 ──
    { tag:'新品', title:'Tomica Premium No.49 日産 GT-R（2025）', desc:'日産 GT-R 2025年モデル登場！990円。', date:'2026.02', series:'Tomica Premium', image:`${B}/2602/pic_tp_49_nissan_gtr2025_01.webp` },
    { tag:'聯名', title:'ドリームトミカ ディズニー 2月発売新作', desc:'2月発売のディズニートミカシリーズ最新作。', date:'2026.02', series:'Disney Tomica', image:`${B}/2602/pic_disney_dt_01.webp` },

    // ── 2026年1月 ──
    { tag:'聯名', title:'Tomica Premium Unlimited タミヤ ミニ四駆 レーサーズボックス', desc:'シャイニングスコーピオン3色付き！6台収納ボックス。6,050円。', date:'2026.01', series:'Tomica Premium Unlimited', image:`${B}/2601/pic_tpu_tamiya_racersbox_01.webp` },
    { tag:'聯名', title:'Tomica Premium Unlimited ミニ四駆 シャイニングスコーピオン', desc:'爆走兄弟レッツ＆ゴー！！の伝説のミニ四駆。1,430円。', date:'2026.01', series:'Tomica Premium Unlimited', image:`${B}/2601/pic_tpu_tamiya_shiningscorpion_01.webp` },
    { tag:'新品', title:'Tomica Premium Toyota スプリンタートレノ（AE92）', desc:'リトラクタブルライト可動・左右ドア開閉。990円。', date:'2026.01', series:'Tomica Premium', image:`${B}/2601/pic_tp_toyota_ae92_01.webp` },
    { tag:'聯名', title:'カーズトミカ シュウ・トドロキ GRC仕様', desc:'カーズ20周年！GRCロゴ入りスピード感あふれるデザイン。', date:'2026.01', series:'Disney Tomica', image:`${B}/2601/pic_disney_cars_shu_grc_01.webp` },
    { tag:'限定', title:'トイザらス限定 Toyota GR スープラ SUGOセーフティーカー', desc:'トイザらスオリジナル。1/1発売。880円。', date:'2026.01', series:'販売店限定', image:`${B}/2601/pic_so_toysrus_grsupra_01.webp` },
    { tag:'限定', title:'イトーヨーカドー限定 日産 フェアレディZ トリコロール', desc:'イトーヨーカドーオリジナル特別カラー仕様。1/1発売。880円。', date:'2026.01', series:'販売店限定', image:`${B}/2601/pic_so_iy_fairladyz_01.webp` },
    { tag:'聯名', title:'ドリームトミカ 星のカービィ くじ（全6種）', desc:'カービィ・メタナイト・デデデ大王など6種のくじトミカ。', date:'2026.01', series:'Dream Tomica', image:`${B}/2601/pic_dt_kirby_01.webp` },
  ];

  res.setHeader('Cache-Control', 's-maxage=86400');
  return res.status(200).json({ items: allItems, updatedAt: Date.now() });
}
