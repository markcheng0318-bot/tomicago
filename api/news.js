export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const allItems = [
  {
    "tag": "新品",
    "title": "No.30 三菱 デリカミニ",
    "desc": "サスペンション。594円。",
    "date": "2026.10",
    "series": "トミカシリーズ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2610/pic_030_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810092445/"
  },
  {
    "tag": "新品",
    "title": "No.34 F80",
    "desc": "サスペンション。594円。",
    "date": "2026.10",
    "series": "トミカシリーズ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2610/pic_034_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810950936/"
  },
  {
    "tag": "新品",
    "title": "トミカスポーツカースペシャルセレクション2",
    "desc": "＜セット内容＞【アクション】。2,420円。",
    "date": "2026.10",
    "series": "ギフトセット",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2610/pic_gift_sportscar_selection2_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810078005/"
  },
  {
    "tag": "聯名",
    "title": "TOMICA TUNES SINGLE PACKS We Love Pompompurin",
    "desc": "サスペンション。1,320円。",
    "date": "2026.10",
    "series": "トミカチューンズ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2610/pic_tunes_pompompurin_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810077848/"
  },
  {
    "tag": "聯名",
    "title": "TOMICA TUNES SINGLE PACKS Hard at Work Pompompurin",
    "desc": "サスペンション。1,320円。",
    "date": "2026.10",
    "series": "トミカチューンズ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2610/pic_tunes_pompompurin_work_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810077855/"
  },
  {
    "tag": "新品",
    "title": "15 トヨタ ハイエース",
    "desc": "左右ドア開閉/後部ドア開閉。990円。",
    "date": "2026.10",
    "series": "トミカプレミアム",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2610/pic_tp_15_toyota_hiace_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810072065/"
  },
  {
    "tag": "新品",
    "title": "トミカプレミアムｕｎｌｉｍｉｔｅｄ 10 よろしくメカドック セリカ XX",
    "desc": "リトラクタブルライト展開・収納。1,320円。",
    "date": "2026.10",
    "series": "トミカプレミアムｕｎｌｉｍｉｔｅｄ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2610/pic_tpu_mechadoc_xx_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810096818/"
  },
  {
    "tag": "新品",
    "title": "トミカＲＥＢＯＲＮ 三菱 パジェロ メタルトップ",
    "desc": "サスペンション、左右ドア開閉。880円。",
    "date": "2026.10",
    "series": "トミカＲＥＢＯＲＮ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2610/pic_reborn_mitsubishi_pajero_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810956563/"
  },
  {
    "tag": "新品",
    "title": "No.59 三菱ふそう スーパーグレート",
    "desc": "594円。",
    "date": "2026.09",
    "series": "トミカシリーズ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_059_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810224099/"
  },
  {
    "tag": "新品",
    "title": "No.93 日産 エルグランド",
    "desc": "サスペンション。594円。",
    "date": "2026.09",
    "series": "トミカシリーズ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_093_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810092360/"
  },
  {
    "tag": "新品",
    "title": "No.136 古河ロックドリル ボルティンガー(B32RL)",
    "desc": "ブーム可動/ケージ可動/キャビン上下。1,100円。",
    "date": "2026.09",
    "series": "トミカシリーズ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_136_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810091905/"
  },
  {
    "tag": "新品",
    "title": "トミカ アドベントカレンダー2026",
    "desc": "クリスマスまでの24日間を楽しくカウントダウン！1日ごとにカレンダーを開けよう！。5,280円。",
    "date": "2026.09",
    "series": "トミカワールド",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_world_adventcalender_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810189121/"
  },
  {
    "tag": "聯名",
    "title": "トミカ ジョブレイバー ＴＪＢ１１ トリップブレイバー はとバス 観光バス",
    "desc": "「特装合体ロボ ジョブレイバー」から新しい観光バスのジョブレイバー『トリップブレイバー はとバス 観光バス』が登場！。3,520円。",
    "date": "2026.09",
    "series": "ジョブレイバー",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_jr_tjb11_hatobus_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g49048109937595/"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ NO.164 マリオカート ワールド マリオ",
    "desc": "ドリームトミカに「マリオカート ワールド」からマリオが登場！ 「マリオカート ワールド」のスタンダードカートに乗ったマリ。990円。",
    "date": "2026.09",
    "series": "ドリームトミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_dream_164_mcw_mario_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810077688/"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ SP マリオカート ワールド ヨッシー",
    "desc": "ドリームトミカに「マリオカート ワールド」からヨッシーが登場！ 「マリオカート ワールド」のスタンダードカートに乗ったヨ。990円。",
    "date": "2026.09",
    "series": "ドリームトミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_dream_sp_mcw_yoshi_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810077695/"
  },
  {
    "tag": "聯名",
    "title": "TOMICA TUNES DISNEY CHARACTERS Vol.3 STITCH COLLECTION",
    "desc": "トミカをキュンキュン！チューンアップ！ 「TOMICA TUNES」にスティッチコレクションが登場！。1,320円。",
    "date": "2026.09",
    "series": "トミカチューンズ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_tunes_vol3_stitch_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g8000000207617/"
  },
  {
    "tag": "聯名",
    "title": "TOMICA TUNES SINGLE PACKS TOMICA&TOM",
    "desc": "サスペンション。1,320円。",
    "date": "2026.09",
    "series": "トミカチューンズ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_tunes_tom_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810074595/"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ くまのプーさん＆フレンズセット",
    "desc": "「くまのプーさん」原作デビュー100周年を記念して、くまのプーさん＆フレンズセットが登場！。4,950円。",
    "date": "2026.09",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_disney_pooh_friends_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810077893/"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ ディズニーモータース グランドドリームキャリー くまのプーさん",
    "desc": "「くまのプーさん」原作デビュー100周年を記念して、グランドドリームキャリーが登場！。4,950円。",
    "date": "2026.09",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_disneymotores_gdc_pooh_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810075424/"
  },
  {
    "tag": "新品",
    "title": "カーズ トミカ ライトニング・マックィーン ピストン・カップ付き （ライトニング・マックィーンデイ 2026特別仕様）",
    "desc": "【ライトニング・マックィーンデイ２０２６】を記念して、「ライトニング・マックィーン」とピストン・カップの優勝トロフィーが。2,200円。",
    "date": "2026.09",
    "series": "カーズ トミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_cars_lightningmcqueen_cup_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810089094/"
  },
  {
    "tag": "新品",
    "title": "カーズ トミカ アドベントカレンダー２０２６",
    "desc": "24日分のカレンダーを1日ごとに開けよう！ 2026年限定生産のカーズ トミカのアドベントカレンダーが登場！。5,280円。",
    "date": "2026.09",
    "series": "カーズ トミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_cars_adventcalender_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810089131/"
  },
  {
    "tag": "新品",
    "title": "13 トヨタ カローラ レビン（AE92）",
    "desc": "左右ドア開閉。990円。",
    "date": "2026.09",
    "series": "トミカプレミアム",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_tp_13_toyota_corolla_levin_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810078906/"
  },
  {
    "tag": "新品",
    "title": "tomica custom works WH26 NISSAN SILVIA",
    "desc": "飾るだけではなく「手に取って楽しめる」ことが特徴のカスタムカーシリーズです。 日本のトミカが世界の『JDM』好きに向けて。2,640円。",
    "date": "2026.09",
    "series": "tomica custom works",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_tp_works_wh26_silvia_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810082002/"
  },
  {
    "tag": "新品",
    "title": "tomica custom works TQ26 NISSAN SILVIA",
    "desc": "飾るだけではなく「手に取って楽しめる」ことが特徴のカスタムカーシリーズです。 日本のトミカが世界の『JDM』好きに向けて。2,640円。",
    "date": "2026.09",
    "series": "tomica custom works",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_tp_works_tq26_silvia_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810082064/"
  },
  {
    "tag": "新品",
    "title": "tomica custom works RD26 Honda NSX",
    "desc": "飾るだけではなく「手に取って楽しめる」ことが特徴のカスタムカーシリーズです。 日本のトミカが世界の『JDM』好きに向けて。2,640円。",
    "date": "2026.09",
    "series": "tomica custom works",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_tp_works_rd26_nsx_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810081593/"
  },
  {
    "tag": "新品",
    "title": "tomica custom works BK26 Honda NSX",
    "desc": "飾るだけではなく「手に取って楽しめる」ことが特徴のカスタムカーシリーズです。 日本のトミカが世界の『JDM』好きに向けて。2,640円。",
    "date": "2026.09",
    "series": "tomica custom works",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_tp_works_bk26_nsx_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810081609/"
  },
  {
    "tag": "新品",
    "title": "トミカプレミアムｕｎｌｉｍｉｔｅｄ 頭文字D 日産 スカイライン GT-R（BNR32）（中里 毅）",
    "desc": "サスペンション、左右ドア開閉。1,430円。",
    "date": "2026.09",
    "series": "トミカプレミアムｕｎｌｉｍｉｔｅｄ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_tpu_iniD_skylineGTR_bnr32_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810994329/"
  },
  {
    "tag": "新品",
    "title": "トミカプレミアムｕｎｌｉｍｉｔｅｄ 頭文字D ホンダ シビック SiR-II（EG6）（庄司 慎吾）",
    "desc": "サスペンション、左右ドア開閉。1,430円。",
    "date": "2026.09",
    "series": "トミカプレミアムｕｎｌｉｍｉｔｅｄ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_tpu_iniD_civic_sirII_eg6_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810994336/"
  },
  {
    "tag": "新品",
    "title": "トミカプレミアムｕｎｌｉｍｉｔｅｄ 爆走兄弟レッツ＆ゴー!! ミニ四駆 プロトセイバーエボリューション",
    "desc": "ローラー回転。1,430円。",
    "date": "2026.09",
    "series": "トミカプレミアムｕｎｌｉｍｉｔｅｄ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_tpu_letsgo_mini4_pse_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810982371/"
  },
  {
    "tag": "新品",
    "title": "トミカプレミアムｕｎｌｉｍｉｔｅｄ 爆走兄弟レッツ＆ゴー!! ミニ四駆 スピンコブラ",
    "desc": "トミカプレミアムｕｎｌｉｍｉｔｅｄに 爆走兄弟レッツ＆ゴー!! ミニ四駆 スピンコブラ が登場！。1,430円。",
    "date": "2026.09",
    "series": "トミカプレミアムｕｎｌｉｍｉｔｅｄ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_tpu_letsgo_mini4_spincobra_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810990710/"
  },
  {
    "tag": "新品",
    "title": "ｔｏｍｉｃａトランスポーター グッドスマイル 初音ミク AMG 2024 Ver.",
    "desc": "トミカプレミアムRacingを積載できる「tomicaトランスポーター」が登場！ オリジナルトランスポーターにトミカプレ。3,300円。",
    "date": "2026.09",
    "series": "トミカプレミアムRacing",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_racing_transporter_hatsunemiku_amg2024_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810064657/"
  },
  {
    "tag": "新品",
    "title": "Automated tomica PARKING with showroom",
    "desc": "トミカ史上最高峰の立体駐車場が登場。トミカプレミアム1台付属。 出入庫時のメカニカルでありながら優雅なドア開閉、ステージ。41,800円。",
    "date": "2026.09",
    "series": "ｔｏｍｉｃａ＋",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_tplus_parking_showroom_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810919063/"
  },
  {
    "tag": "限定",
    "title": "タカラトミーモールオリジナル 復刻版トミカプレミアム フォルクスワーゲン タイプI",
    "desc": "サスペンション。1,210円。",
    "date": "2026.09",
    "series": "タカラトミーモールオリジナル",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_ttm_tp_volkswagen_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810064534/"
  },
  {
    "tag": "新品",
    "title": "No.6 マツダ CX-5",
    "desc": "サスペンション。594円。",
    "date": "2026.08",
    "series": "トミカシリーズ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2608/pic_006_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810092391/"
  },
  {
    "tag": "新品",
    "title": "No.76 日産 エクストレイル パトロールカー",
    "desc": "サスペンション。594円。",
    "date": "2026.08",
    "series": "トミカシリーズ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2608/pic_076_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810224112/"
  },
  {
    "tag": "新品",
    "title": "Honda MUGEN COLLECTION",
    "desc": "トミカギフトセットから「MUGEN」仕様の車両を含む3台セットが登場！。2,420円。",
    "date": "2026.08",
    "series": "ギフトセット",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2608/pic_gift_mugencollection_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810078074/"
  },
  {
    "tag": "聯名",
    "title": "トミカ・プラレールブロック ファイヤーレスキューセット",
    "desc": "初めてでも簡単で、トミカやプラレールといっしょに遊べる楽しいブロックが登場！ 全32パーツのブロックを使って、はしご消防。4,950円。",
    "date": "2026.08",
    "series": "トミカ・プラレールブロック",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2608/pic_block_firerescueset_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810095965/"
  },
  {
    "tag": "聯名",
    "title": "トミカ ジョブレイバー ＴＪＢＤＸ ライジングポリスブレイバーＺＥＲＯ デカライドアーマー黒バイＤＸセット",
    "desc": "ポリスブレイバーZEROと『デカライドアーマー 黒バイ』がセットになって登場！ 「ライジングポリスブレイバーZERO」が。8,800円。",
    "date": "2026.08",
    "series": "トミカ ジョブレイバー",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2608/pic_jr_rpbzero_dra_bbdxset_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810944881/"
  },
  {
    "tag": "聯名",
    "title": "トーマストミカ はじめて物語 トーマスとジェームスセット",
    "desc": "連結・切り離し。2,200円。",
    "date": "2026.08",
    "series": "トーマストミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2608/pic_thomas_hajimete_thomasjames_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810072171/"
  },
  {
    "tag": "新品",
    "title": "カーズ トミカ SP ジャクソン・ストーム（20周年記念タイプ）",
    "desc": "2026年は映画『カーズ』公開と「カーズ トミカ」の誕生から20周年のアニバーサリーイヤー！ 20周年を記念したデザイン。935円。",
    "date": "2026.08",
    "series": "カーズ トミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2608/pic_cars_sp_jacksonstorm_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810088974/"
  },
  {
    "tag": "新品",
    "title": "カーズ トミカ SP クルーズ・ラミレス（20周年記念タイプ）",
    "desc": "2026年は映画『カーズ』公開と「カーズ トミカ」の誕生から20周年のアニバーサリーイヤー！ 20周年を記念したデザイン。935円。",
    "date": "2026.08",
    "series": "カーズ トミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2608/pic_cars_sp_ramirez_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810088981/"
  },
  {
    "tag": "新品",
    "title": "カーズ トミカ でるでるバケツ ライトニング・マックィーンver.",
    "desc": "2026年は映画『カーズ』公開と「カーズ トミカ」の誕生から20周年のアニバーサリーイヤー！ カーズ トミカから、ライト。4,620円。",
    "date": "2026.08",
    "series": "カーズ トミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2608/pic_cars_sp_deruderu_bucket_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810088998/"
  },
  {
    "tag": "新品",
    "title": "24 トヨタ マークX 覆面パトロールカー",
    "desc": "左右ドア開閉、警光灯可動。990円。",
    "date": "2026.08",
    "series": "トミカプレミアム",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2608/pic_tp_24_markx_fukumen_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810092872/"
  },
  {
    "tag": "新品",
    "title": "トミカプレミアムｕｎｌｉｍｉｔｅｄ 14 昴と彗星 SUBARU BRZ（佐藤 昴）",
    "desc": "サスペンション、左右ドア開閉。1,320円。",
    "date": "2026.08",
    "series": "トミカプレミアムｕｎｌｉｍｉｔｅｄ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2608/pic_tpu_14_subaru_brz_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810079828/"
  },
  {
    "tag": "限定",
    "title": "カーズ トミカ ドック・ハドソン ピストン・カップ付き （ライトニング・マックィーンデイ 2026特別仕様）",
    "desc": "【ライトニング・マックィーンデイ2026】を記念して、「ドッグ・ハドソン」とピストン・カップの優勝トロフィーのセットがカ。2,200円。",
    "date": "2026.08",
    "series": "タカラトミーモールオリジナル",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2608/pic_ttmo_cars_dochudson_cup_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810089100/"
  },
  {
    "tag": "限定",
    "title": "タカラトミーモールオリジナル トミカプレミアム トヨタ スプリンター トレノ（AE92）",
    "desc": "左右ドア開閉、リトラクタブルライト可動。1,155円。",
    "date": "2026.08",
    "series": "タカラトミーモールオリジナル",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2608/pic_ttmo_tp_sprinter_trueno_ae92_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810072041/"
  },
  {
    "tag": "限定",
    "title": "トミカＲＥＢＯＲＮ トヨタ スープラ",
    "desc": "サスペンション、左右ドア開閉。880円。",
    "date": "2026.08",
    "series": "タカラトミーモールオリジナル",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2608/pic_ttmo_reborn_supra_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810079880/"
  },
  {
    "tag": "限定",
    "title": "エディオンオリジナル 日産 シルビア（S13）",
    "desc": "サスペンション、左右ドア開閉。880円。",
    "date": "2026.08",
    "series": "販売店オリジナルトミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2608/pic_so_edion_01.webp",
    "buyUrl": null
  },
  {
    "tag": "限定",
    "title": "ドン・キホーテ アピタ ピアゴ オリジナル トヨタ アルファード",
    "desc": "サスペンション。880円。",
    "date": "2026.08",
    "series": "販売店オリジナルトミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2608/pic_so_apita_01.webp",
    "buyUrl": null
  },
  {
    "tag": "限定",
    "title": "トミカショップオリジナル トミカタウン警察パトロールカー",
    "desc": "サスペンション。880円。",
    "date": "2026.08",
    "series": "販売店オリジナルトミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2608/pic_so_tomiplashop_01.webp",
    "buyUrl": null
  },
  {
    "tag": "限定",
    "title": "寿司トミカ リラックマ",
    "desc": "トミカが本格的な寿司になった「寿司トミカ」シリーズにリラックマが登場！。1,320円。",
    "date": "2026.08",
    "series": "販売店オリジナルトミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2608/pic_so_kiddyland_01.webp",
    "buyUrl": null
  },
  {
    "tag": "新品",
    "title": "No.24 キャンピングカー",
    "desc": "ドア開閉/サイドタープ設営、収納/自転車積み下ろし。594円。",
    "date": "2026.07",
    "series": "トミカシリーズ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_024_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810092384/"
  },
  {
    "tag": "新品",
    "title": "No.52 ミニクーパー SE カントリーマン All4",
    "desc": "サスペンション。594円。",
    "date": "2026.07",
    "series": "トミカシリーズ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_052_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810917441/"
  },
  {
    "tag": "新品",
    "title": "スクランブルポリスステーション",
    "desc": "電動回転駐車場！楽しい3つの出動遊び！サウンド満載！ トミカの出動遊びが楽しい警察署「スクランブルポリスステーション」が。9,350円。",
    "date": "2026.07",
    "series": "トミカワールド",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_tw_scramblepolicestation_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810074601/"
  },
  {
    "tag": "聯名",
    "title": "トミカ・プラレールブロック パトロールセット",
    "desc": "初めてでも簡単で、トミカやプラレールといっしょに遊べる楽しいブロックが登場！ 全24パーツのブロックを使って、パトロール。3,850円。",
    "date": "2026.07",
    "series": "トミカ・プラレールブロック",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_block_patrolset_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810095958/"
  },
  {
    "tag": "聯名",
    "title": "トミカ ジョブレイバー TJBEX キャリーブレイバー ハローキティ エクスプレス トラック",
    "desc": "「ハローキティ」と「ジョブレイバー」のハッピーオーラ満載のコラボレーション！。4,180円。",
    "date": "2026.07",
    "series": "トミカ ジョブレイバー",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_jr_tjbex_hellokitty_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810995487/"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ SP まいぜんシスターズ ぜんいち＆マイッキー",
    "desc": "サスペンション。1,650円。",
    "date": "2026.07",
    "series": "ドリームトミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_dt_maizen_zenichi_maickey_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810077664/"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ SP トミカとトム トミカだいすき",
    "desc": "サスペンション。880円。",
    "date": "2026.07",
    "series": "ドリームトミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_dt_tom_daisuki_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810074564/"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ SP トミカとトム トムときょうりゅう",
    "desc": "サスペンション。880円。",
    "date": "2026.07",
    "series": "ドリームトミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_dt_tom_kyoryu_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810074571/"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ SP トミカとトム トミカであそぼう",
    "desc": "サスペンション。880円。",
    "date": "2026.07",
    "series": "ドリームトミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_dt_tom_asobou_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810074588/"
  },
  {
    "tag": "聯名",
    "title": "TOMICA TUNES TOYSTORY CHARACTERS",
    "desc": "サスペンション。1,320円。",
    "date": "2026.07",
    "series": "トミカチューンズ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_tunes_toystory_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g8000000207552/"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ ライドオン トイ・ストーリー５ バズ・ライトイヤー 宇宙船ケース ハイテク版",
    "desc": "キャラクターフィギュアとトミカがセットになった『ドリームトミカ ライドオン』シリーズからトイ・ストーリー トミカが収納で。4,400円。",
    "date": "2026.07",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_disney_toystory5_buzz_hightech_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810068280/"
  },
  {
    "tag": "聯名",
    "title": "トーマストミカ 08 ヘンリー",
    "desc": "連結・切り離し。825円。",
    "date": "2026.07",
    "series": "トーマストミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_thomas_08_henry_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810072188/"
  },
  {
    "tag": "新品",
    "title": "05 ランボルギーニ ミウラ P400S",
    "desc": "前後カウル開閉。990円。",
    "date": "2026.07",
    "series": "トミカプレミアム",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_tp_05_lamborghini_miura_p400s_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810092889/"
  },
  {
    "tag": "新品",
    "title": "Lamborghini 3 MODELS Collection",
    "desc": "「Lamborghini」が3台セットになって登場！。3,520円。",
    "date": "2026.07",
    "series": "トミカプレミアム",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_tp_lamborghini_3models_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810077725/"
  },
  {
    "tag": "新品",
    "title": "トミカプレミアムＲａｃｉｎｇ マツダ 787B",
    "desc": "カウル脱着。1,980円。",
    "date": "2026.07",
    "series": "トミカプレミアムＲａｃｉｎｇ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_racing_mazda_787b_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810097082/"
  },
  {
    "tag": "新品",
    "title": "トミカプレミアムＲａｃｉｎｇ マツダ 787B 18号車",
    "desc": "カウル脱着。1,980円。",
    "date": "2026.07",
    "series": "トミカプレミアムＲａｃｉｎｇ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_racing_mazda_787b18_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810097099/"
  },
  {
    "tag": "新品",
    "title": "tomica GARAGE Smart STONE GRAY Standard edition",
    "desc": "ガレージをリモコン操作でスマートに開閉できる商品が登場。 付属のコントローラーで、従来の電動シャッターの開閉、室内の点灯。7,700円。",
    "date": "2026.07",
    "series": "ｔｏｍｉｃａ＋",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_garage_smartstone_se_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810080817/"
  },
  {
    "tag": "新品",
    "title": "トミカＲＥＢＯＲＮ トヨタ スープラ",
    "desc": "サスペンション、左右ドア開閉。880円。",
    "date": "2026.07",
    "series": "トミカＲＥＢＯＲＮ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_reborn_toyota_supra_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810956570/"
  },
  {
    "tag": "限定",
    "title": "復刻版 トミカプレミアム 三菱 パジェロ",
    "desc": "トミカプレミアムで、惜しまれながら生産が終了した車種から厳選して復刻いたします。 今回は「三菱 パジェロ」が登場です！。1,210円。",
    "date": "2026.07",
    "series": "タカラトミーモールオリジナル",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_ttmo_reprint_tp_pajero_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810079859/"
  },
  {
    "tag": "限定",
    "title": "トミカプレミアムｕｎｌｉｍｉｔｅｄ 爆走兄弟レッツ＆ゴー!! ミニ四駆 サイクロンマグナム（ブルーメタリックVer.）＆ ハリケーンソニック（レッドメタリックVer.）",
    "desc": "「トミカ」と「タミヤ」の夢のコラボ！。3,300円。",
    "date": "2026.07",
    "series": "タカラトミーモールオリジナル",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_ttmo_tpu_letsgo_cyclone_sonic_01.webp",
    "buyUrl": "https://takaratomymall.jp/shop/g/g4904810065272/"
  },
  {
    "tag": "限定",
    "title": "AEON NO.87 トヨタ カムリ スポーツ 日本警察パトロールカー仕様",
    "desc": "サスペンション。880円。",
    "date": "2026.07",
    "series": "販売店オリジナルトミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_so_aeon_01.webp",
    "buyUrl": null
  },
  {
    "tag": "限定",
    "title": "TCNオリジナル TOYOTA GAZOO Racing トランスポーター",
    "desc": "TOYOTA GAZOO Racing トランスポーター がTCNオリジナルとして登場！。880円。",
    "date": "2026.07",
    "series": "販売店オリジナルトミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2607/pic_so_tcn_01.webp",
    "buyUrl": null
  },
  {
    "tag": "新品",
    "title": "No.19 ホンダ Super-ONE",
    "desc": "サスペンション。594円。",
    "date": "2026.06",
    "series": "トミカシリーズ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_019_01.webp"
  },
  {
    "tag": "新品",
    "title": "No.57 化石運搬車",
    "desc": "化石積み下ろし。594円。",
    "date": "2026.06",
    "series": "トミカシリーズ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_057_01.webp"
  },
  {
    "tag": "新品",
    "title": "No.132 モリタ 小型オフロード消防車 レッドレディバグ ＆ 搬送車",
    "desc": "レッドレディバグ：サスペンション 搬送車：クレーン可動、スロープ可動、コンテナ積み下ろし、ボート連結・切り離し。1,100円。",
    "date": "2026.06",
    "series": "トミカシリーズ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_132_01.webp"
  },
  {
    "tag": "新品",
    "title": "トミカタウンをパトロール！ トミカ警察車両セット",
    "desc": "＜セット内容＞【アクション】 ・トミカタウン移動交番（トヨタ ハイエース）【サスペンション】。2,420円。",
    "date": "2026.06",
    "series": "トミカギフトセット",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_gift_town_policecarset_01.webp"
  },
  {
    "tag": "新品",
    "title": "トミカビークルタウン 変形パトロールカー（トミカ付き）",
    "desc": "ビッグビークル手転がし遊び＆変形タウン遊びの両方が楽しめる、ダイキャストトミカ付きオールインワンセット！ 付属トミカは「。4,400円。",
    "date": "2026.06",
    "series": "トミカワールド",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_world_tvt_patrolcar_01.webp"
  },
  {
    "tag": "新品",
    "title": "トミカビークルタウン 変形ショベルカー（トミカ付き）",
    "desc": "ビッグビークル手転がし遊び＆変形タウン遊びの両方が楽しめる、ダイキャストトミカ付きオールインワンセット！ 付属トミカは「。4,400円。",
    "date": "2026.06",
    "series": "トミカワールド",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_world_tvt_excavatorcar_01.webp"
  },
  {
    "tag": "新品",
    "title": "トミカタウン ヤマト運輸営業所（トミカ、配達員、小物付き）",
    "desc": "トミカタウンにヤマト運輸営業所が登場！ さらにトミカ、配達員、小物付きで、セット内容盛りだくさん！。2,640円。",
    "date": "2026.06",
    "series": "トミカワールド",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_world_town_kuronekoyamato_01.webp"
  },
  {
    "tag": "聯名",
    "title": "トミカ ジョブレイバー TJB10 ポリスブレイバー スズキ ハスラー ミニパトロールカー",
    "desc": "「特装合体ロボ ジョブレイバー」から新しい警察のジョブレイバー『ポリスブレイバー スズキ ハスラー ミニパトロールカー』。3,520円。",
    "date": "2026.06",
    "series": "トミカ ジョブレイバー",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_jr_TJB10_suzuki_hustler_01.webp"
  },
  {
    "tag": "聯名",
    "title": "トミカ ジョブレイバー TJBEX アイスブレイバー ガリガリ君 輸送トラック",
    "desc": "「特装合体ロボ ジョブレイバー」から新しいアイス輸送トラックのジョブレイバー『アイスブレイバー ガリガリ君 輸送トラック。3,520円。",
    "date": "2026.06",
    "series": "トミカ ジョブレイバー",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_jr_TJBEX_garigarikun_01.webp"
  },
  {
    "tag": "聯名",
    "title": "DREAM TOMICA CONVERSE ALL STAR COLLECTION VOL.1",
    "desc": "ドリームトミカが「コンバース」とコラボレーション！ 人気のシューズ「オールスター」をモチーフにデザインしたトミカです。。1,100円。",
    "date": "2026.06",
    "series": "ドリームトミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_dt_converse_allstar_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ No.180 ディズニートミカパレード トイ・ストーリー５",
    "desc": "おうちにディズニートミカパレードがやってくる！夢の世界をつなげよう！ ドリームトミカに【ディズニートミカパレード】シリー。1,100円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_180_dtp_toystory5_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ ライドオン トイ・ストーリー５ SP ウッディ＆ブルズアイ",
    "desc": "キャラクターフィギュアとトミカがセットになった『ドリームトミカ ライドオン』シリーズから「ウッディ＆ブルズアイ」が登場！。1,100円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_dtro_toystory5_woody_bullseye_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ ライドオン トイ・ストーリー５ SP ハイテク版 バズ・ライトイヤー＆宇宙船",
    "desc": "キャラクターフィギュアとトミカがセットになった『ドリームトミカ ライドオン』シリーズから「ハイテク版 バズ・ライトイヤー。1,100円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_dtro_toystory5_buzz_spaceship_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ ライドオン トイ・ストーリー５ SP ジェシー＆ブルズアイ",
    "desc": "キャラクターフィギュアとトミカがセットになった『ドリームトミカ ライドオン』シリーズから「ジェシー＆ブルズアイ」が登場！。1,100円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_dtro_toystory5_jessie_bullseye_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ ライドオン トイ・ストーリー SP ジェシー＆アンディのおもちゃ箱",
    "desc": "キャラクターフィギュアとトミカがセットになった『ドリームトミカ ライドオン』シリーズから「ジェシー＆アンディのおもちゃ箱。1,100円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_dtro_toystory_jessie_toysbox_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ ライドオン トイ・ストーリー SP ボー・ピープ＆スカンクカー",
    "desc": "キャラクターフィギュアとトミカがセットになった『ドリームトミカ ライドオン』シリーズから「ボー・ピープ＆スカンクカー」が。1,100円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_dtro_toystory_bopeep_skunkcar_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ ライドオン トイ・ストーリー SP レックス＆スケートボード",
    "desc": "キャラクターフィギュアとトミカがセットになった『ドリームトミカ ライドオン』シリーズから「レックス＆スケートボード」が登。1,100円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_dtro_toystory_rex_skateboard_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ ライドオン トイ・ストーリー SP ハム＆アンディのイス",
    "desc": "キャラクターフィギュアとトミカがセットになった『ドリームトミカ ライドオン』シリーズから「ハム＆アンディのイス」が登場！。1,100円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_dtro_toystory_hamm_chair_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ ライドオン トイ・ストーリー SP スリンキー・ドッグ＆ダンボールトイボックス",
    "desc": "キャラクターフィギュアとトミカがセットになった『ドリームトミカ ライドオン』シリーズからスリンキー・ドッグ＆ダンボールト。1,100円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_dtro_toystory_slinkydog_cardboardbox_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ ライドオン トイ・ストーリー SP エイリアン＆スペースクレーン",
    "desc": "キャラクターフィギュアとトミカがセットになった『ドリームトミカ ライドオン』シリーズから「エイリアン＆スペースクレーン」。1,100円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_dtro_toystory_aliens_spacecrane_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ SP ディズニーモータース ジョリーフロート トイ・ストーリー５",
    "desc": "映画『トイ・ストーリー５』の公開を記念して、ディズニーモータースから「ジョリーフロート トイ・ストーリー５」が登場！。880円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_motors_jollyfloat_toystory5_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ SP ディズニーモータース ドリームジャーニー ウッディ",
    "desc": "映画『トイ・ストーリー５』の公開を記念して、ディズニーモータースから「ドリームジャーニー ウッディ」が登場！。880円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_motors_dream_woody_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ SP ディズニーモータース ハイハットクラシック ウッディ",
    "desc": "映画『トイ・ストーリー５』の公開を記念して、ディズニーモータースから「ハイハットクラシック ウッディ」が登場！。880円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_motors_highhatclassic_woody_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ SP ディズニーモータース ドリームスターII バズ・ライトイヤー",
    "desc": "映画『トイ・ストーリー５』の公開を記念して、ディズニーモータースから「ドリームスターII バズ・ライトイヤー」が登場！。880円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_motors_dreamstar2_buzz_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ SP ディズニーモータース ポピンズ ボー・ピープ",
    "desc": "映画『トイ・ストーリー５』の公開を記念して、ディズニーモータースから「ポピンズ ボー・ピープ」が登場！。880円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_motors_poppins_bopeep_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ SP ディズニーモータース キュビット エイリアン",
    "desc": "映画『トイ・ストーリー５』の公開を記念して、ディズニーモータースから「キュビット エイリアン」が登場！。880円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_motors_cubit_alien_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ SP ディズニーモータース チムチム フォーキー",
    "desc": "映画『トイ・ストーリー５』の公開を記念して、ディズニーモータースから「チムチム フォーキー」が登場！。880円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_motors_chimchim_forky_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ ディズニーモータース パルズトランポ トイ・ストーリー５ ウッディ",
    "desc": "映画『トイ・ストーリー５』の公開を記念して、ディズニーモータースからキャリアカーの「パルズトランポ ウッディ」が登場！。2,750円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_motors_palstranpo_toystory5_woody_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ ディズニーモータース パルズトランポ トイ・ストーリー５ バズ・ライトイヤー",
    "desc": "映画『トイ・ストーリー５』の公開を記念して、ディズニーモータースからキャリアカーの「パルズトランポ バズ・ライトイヤー」。2,750円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_motors_palstranpo_toystory5_buzz_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ ディズニーモータース パルズトランポ トイ・ストーリー５ ジェシー",
    "desc": "映画『トイ・ストーリー５』の公開を記念して、ディズニーモータースからキャリアカーの「パルズトランポ ジェシー」が登場！。2,750円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_motors_palstranpo_toystory5_jessie_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ ディズニーモータース トイズキャリー トイ・ストーリー５",
    "desc": "ディズニーモータースを8台運べるキャリアカーが登場！。4,400円。",
    "date": "2026.06",
    "series": "ディズニートミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_disney_motors_toyscarrier_toystory5_01.webp"
  },
  {
    "tag": "新品",
    "title": "カーズ トミカ C-03 ライトニング・マックィーン (20周年記念タイプ)",
    "desc": "2026年は映画『カーズ』公開と「カーズ トミカ」の誕生から20周年のアニバーサリーイヤー！ 20周年を記念したデザイン。935円。",
    "date": "2026.06",
    "series": "カーズ トミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_cars_c03_20th_01.webp"
  },
  {
    "tag": "新品",
    "title": "カーズ トミカ C-14 メーター (20周年記念タイプ)",
    "desc": "2026年は映画『カーズ』公開と「カーズ トミカ」の誕生から20周年のアニバーサリーイヤー！ 20周年を記念したデザイン。935円。",
    "date": "2026.06",
    "series": "カーズ トミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_cars_c14_20th_01.webp"
  },
  {
    "tag": "新品",
    "title": "23 トヨタ セリカ GT-FOUR RC",
    "desc": "リトラクタブルライト可動。990円。",
    "date": "2026.06",
    "series": "トミカプレミアム",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_tp_13_toyota_celica_gtfourrc_01.webp"
  },
  {
    "tag": "新品",
    "title": "tomicaトランスポーター 日産 NISSAN GT-R NISMO Special edition",
    "desc": "トミカプレミアムを積載できる「tomicaトランスポーター」が登場！ オリジナルトランスポーターにトミカプレミアムを積載。2,860円。",
    "date": "2026.06",
    "series": "トミカプレミアム",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_tp_ttp_nissan_gtr_nismo_se_01.webp"
  },
  {
    "tag": "新品",
    "title": "トミカプレミアムｕｎｌｉｍｉｔｅｄ 13 トイ・ストーリー ピザ・プラネットトラック",
    "desc": "サスペンション。1,320円。",
    "date": "2026.06",
    "series": "トミカプレミアムｕｎｌｉｍｉｔｅｄ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_tpu_13_toystory_pizzatruck_01.webp"
  },
  {
    "tag": "新品",
    "title": "トミカプレミアムｕｎｌｉｍｉｔｅｄ 爆走兄弟レッツ＆ゴー!! ミニ四駆 レイスティンガー",
    "desc": "ローラー回転。1,430円。",
    "date": "2026.06",
    "series": "トミカプレミアムｕｎｌｉｍｉｔｅｄ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_tpu_letsgo_raystinger_01.webp"
  },
  {
    "tag": "新品",
    "title": "トミカプレミアムｕｎｌｉｍｉｔｅｄ 爆走兄弟レッツ＆ゴー!! ミニ四駆 ブロッケンギガント",
    "desc": "ローラー回転。1,430円。",
    "date": "2026.06",
    "series": "トミカプレミアムｕｎｌｉｍｉｔｅｄ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_tpu_letsgo_brockengigant_01.webp"
  },
  {
    "tag": "新品",
    "title": "トミカプレミアムＲａｃｉｎｇ GR GT3",
    "desc": "左右ドア開閉。1,980円。",
    "date": "2026.06",
    "series": "トミカプレミアムＲａｃｉｎｇ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_tpr_grgt3_01.webp"
  },
  {
    "tag": "新品",
    "title": "GR GT",
    "desc": "「GR GT」が、トミカになって登場です。。880円。",
    "date": "2026.06",
    "series": "トミカその他",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_other_grgt_01.webp"
  },
  {
    "tag": "限定",
    "title": "トミカショップオリジナル ホンダ シビック TYPE R",
    "desc": "サスペンション。880円。",
    "date": "2026.06",
    "series": "販売店オリジナルトミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_so_tomicaplarailshop_01.webp"
  },
  {
    "tag": "限定",
    "title": "スヌーピータウンショップオリジナルドリームトミカ Snoopy＆Siblings",
    "desc": "サスペンション。880円。",
    "date": "2026.06",
    "series": "販売店オリジナルトミカ",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2606/pic_so_snoopy_01.webp"
  },
  {
    "tag": "新品",
    "title": "No.16 日本交通計程車",
    "desc": "日本交通計程車造型・附懸吊功能。594日圓。",
    "date": "2026.05",
    "series": "一般系列",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2605/pic_016_01.webp"
  },
  {
    "tag": "新品",
    "title": "No.89 Toyota GR Yaris",
    "desc": "Toyota GR Yaris 跑車款・附懸吊功能。594日圓。",
    "date": "2026.05",
    "series": "一般系列",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2605/pic_089_01.webp"
  },
  {
    "tag": "聯名",
    "title": "TOMICA TUNES 三麗鷗角色 Vol.2",
    "desc": "Hello Kitty、布丁狗等6種・薄荷巧克力配色。1,320日圓。",
    "date": "2026.05",
    "series": "Tomica Tunes",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2605/pic_tunes_sanrio_vol02_01.webp"
  },
  {
    "tag": "新品",
    "title": "Tomica Premium No.21 Mercedes-Benz 190E 2.5-16 Evo II",
    "desc": "1/62比例・附懸吊＆雙門開閉功能。990日圓。",
    "date": "2026.05",
    "series": "Tomica Premium",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2605/pic_tp_21_mercedesbenz_190e21516_evo2_01.webp"
  },
  {
    "tag": "聯名",
    "title": "Tomica Premium Unlimited 星際大戰 Razor Crest",
    "desc": "《曼達洛人》Razor Crest飛船・附展示台。1,430日圓。",
    "date": "2026.05",
    "series": "Tomica Premium Unlimited",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2605/pic_tpu_starwars_razorcrest_01.webp"
  },
  {
    "tag": "限定",
    "title": "AEON限定 No.86 Toyota Corolla 德國警察塗裝",
    "desc": "全國AEON限定・5/23發售。880日圓。",
    "date": "2026.05",
    "series": "販売店限定",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2605/pic_so_aeon_01.webp"
  },
  {
    "tag": "新品",
    "title": "トミカビークルタウン ビッグに変形消防署",
    "desc": "ダイキャストトミカ付きオールインワンセット。4,400円。",
    "date": "2026.04",
    "series": "Tomica Town",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2604/pic_vehicletown_fire_01.webp"
  },
  {
    "tag": "限定",
    "title": "トイザらス限定 Honda シビック TYPE R Ultimate Edition",
    "desc": "トイザらスオリジナル特別塗装仕様。880円。4/18発売。",
    "date": "2026.04",
    "series": "販売店限定",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2604/pic_so_toysrus_civictypre_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ジョブレイバー デカライドアーマー 白バイ",
    "desc": "交通機動隊ジョブロイドと特装合体！警察ロボが完成。",
    "date": "2026.04",
    "series": "Job Braver",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2604/pic_jobraver_decaridearmor_01.webp"
  },
  {
    "tag": "聯名",
    "title": "TOMICA TUNES ドラえもん（全7種）",
    "desc": "ドラえもん・ドラミ・のび太など全7種（シークレット含む）。",
    "date": "2026.03",
    "series": "Tomica Tunes",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2603/pic_tunes_doraemon_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ スポンジ・ボブ",
    "desc": "リア部分に「カーニバーガー」付き！スポンジ・ボブトミカ。",
    "date": "2026.03",
    "series": "Dream Tomica",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2603/pic_dt_spongebob_01.webp"
  },
  {
    "tag": "新品",
    "title": "寿司トミカ 軍艦巻き（全6種）",
    "desc": "サーモン・たこ・いくら・中とろなど6種。寿司皿付き！",
    "date": "2026.03",
    "series": "Dream Tomica",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2603/pic_dt_sushi_gunkan_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ジョブレイバー トラフィックポリス 2体セット",
    "desc": "トヨタ クラウン覆面パトロールカー＆ハイエース遊撃車が合体。6,600円。",
    "date": "2026.03",
    "series": "Job Braver",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2603/pic_jobraver_trafficpolice_01.webp"
  },
  {
    "tag": "新品",
    "title": "Tomica Premium No.49 日産 GT-R（2025）",
    "desc": "日産 GT-R 2025年モデル登場！990円。",
    "date": "2026.02",
    "series": "Tomica Premium",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2602/pic_tp_49_nissan_gtr2025_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ ディズニー 2月発売新作",
    "desc": "2月発売のディズニートミカシリーズ最新作。",
    "date": "2026.02",
    "series": "Disney Tomica",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2602/pic_disney_dt_01.webp"
  },
  {
    "tag": "聯名",
    "title": "Tomica Premium Unlimited タミヤ ミニ四駆 レーサーズボックス",
    "desc": "シャイニングスコーピオン3色付き！6台収納ボックス。6,050円。",
    "date": "2026.01",
    "series": "Tomica Premium Unlimited",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2601/pic_tpu_tamiya_racersbox_01.webp"
  },
  {
    "tag": "聯名",
    "title": "Tomica Premium Unlimited ミニ四駆 シャイニングスコーピオン",
    "desc": "爆走兄弟レッツ＆ゴー！！の伝説のミニ四駆。1,430円。",
    "date": "2026.01",
    "series": "Tomica Premium Unlimited",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2601/pic_tpu_tamiya_shiningscorpion_01.webp"
  },
  {
    "tag": "新品",
    "title": "Tomica Premium Toyota スプリンタートレノ（AE92）",
    "desc": "リトラクタブルライト可動・左右ドア開閉。990円。",
    "date": "2026.01",
    "series": "Tomica Premium",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2601/pic_tp_toyota_ae92_01.webp"
  },
  {
    "tag": "聯名",
    "title": "カーズトミカ シュウ・トドロキ GRC仕様",
    "desc": "カーズ20周年！GRCロゴ入りスピード感あふれるデザイン。",
    "date": "2026.01",
    "series": "Disney Tomica",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2601/pic_disney_cars_shu_grc_01.webp"
  },
  {
    "tag": "限定",
    "title": "トイザらス限定 Toyota GR スープラ SUGOセーフティーカー",
    "desc": "トイザらスオリジナル。1/1発売。880円。",
    "date": "2026.01",
    "series": "販売店限定",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2601/pic_so_toysrus_grsupra_01.webp"
  },
  {
    "tag": "限定",
    "title": "イトーヨーカドー限定 日産 フェアレディZ トリコロール",
    "desc": "イトーヨーカドーオリジナル特別カラー仕様。1/1発売。880円。",
    "date": "2026.01",
    "series": "販売店限定",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2601/pic_so_iy_fairladyz_01.webp"
  },
  {
    "tag": "聯名",
    "title": "ドリームトミカ 星のカービィ くじ（全6種）",
    "desc": "カービィ・メタナイト・デデデ大王など6種のくじトミカ。",
    "date": "2026.01",
    "series": "Dream Tomica",
    "image": "https://www.takaratomy.co.jp/products/tomica/new/images/2601/pic_dt_kirby_01.webp"
  }
];

  res.setHeader('Cache-Control', 's-maxage=86400');
  return res.status(200).json({ items: allItems, updatedAt: 1786081523672 });
}
