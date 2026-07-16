# 検品レポート — 海老勢 HP（2026-07-16）

> hp-seo-qa の基準と `docs/delivery-checklist.md` による検品。
> 本件は**ヒアリング回答前のドラフト納品**。プレースホルダは意図した状態だが、公開ブロッカーとして🔴に計上する。

## 🔴 CRITICAL（本番公開のブロッカー。ドラフト納品としては既知・意図済み）

- [site全体] 電話番号（0256-XX-XXXX / tel:0000000000）・住所番地（X-XX）・構造化データの telephone / streetAddress がプレースホルダ
  → `delivery.md` の差し替え表を消化してから公開する。`site-src/build.mjs` の SITE 定数を書き換えて再ビルド
- [_redirects / vercel.json] 301対応表が検索結果から判明した3URLのみ。**旧サイトの全URL洗い出しが未完**
  → サーバーのファイル一覧・Search Console を確認するまで公開しない（sitemap.md の手順）
- [site全体] 営業時間・定休日・「毎日市場で買い付け」等の事実が公開情報ベースで未裏取り
  → questions.md 🔴項目のクライアント回答をもって確定
- [robots.txt / canonical / og:url] ドメイン `www.ebise.jp` は継続利用の仮定
  → ドメイン管理者の確認（questions.md #1）後に確定

## 🟡 WARNING

- [/menu/ ほか] 価格が全品「—」。**価格を隠すと問い合わせは減る。** メニュー・コース価格の支給後、最優先で掲載する（意図した暫定）
- [og.png] 検証環境のフォント制約でゴシック体の暫定版。公開前にロゴ入りで再生成が望ましい（`site-src` の再生成手順は delivery.md）
- [reserve] フォームは Netlify Forms 前提。Vercel / Cloudflare Pages に置く場合はフォームバックエンドの差し替えが必要（delivery.md に手順）
- [access] Googleマップ埋め込みは店名検索ベース。番地確定後、ピン位置を確認すること

## 🟢 SUGGESTION

- お知らせを運用したくなったら Instagram 埋め込みが最小コスト（CMS導入より先に検討）
- GA4 と Search Console の導入（導入時は privacy ページに追記が必要）
- 支給写真が揃ったら `.ph`（写真スロット）を `<img>`（WebP・width/height指定・`loading="lazy"`）へ差し替え。ファーストビューに入る画像には `lazy` を付けない

## 実測済みチェック（証跡）

| 項目 | 結果 | 方法 |
|---|---|---|
| 秘匿情報（APIキー・認証情報の類） | 混入なし | 検品リスト所定の `grep -ri` 全ファイル走査 |
| noindex の残骸 | 404のみ（意図的） | `grep -rn noindex site/` |
| title / meta description | 全7ページ固有・重複なし | grep で全数照合 |
| OGP / canonical / 構造化データ | 全ページ出力（Restaurant + BreadcrumbList） | 生成HTML確認 |
| sitemap.xml / robots.txt | あり（404は sitemap から除外） | 生成物確認 |
| 内部リンク・アセット | 全URL 200、リンク切れなし | ローカルサーバ + curl 全数 |
| 375px 表示 | 全5ページで横はみ出し 0px | Playwright 実測 + スクリーンショット目視 |
| フォーム検証 | 空送信→3項目にインラインエラー／電話形式エラー／「未定」チェックで日付必須解除／送信失敗時のフォールバック表示、すべて動作 | Playwright 実測 |
| キーボードフォーカス | 3px 朱のアウトライン可視 | Playwright 実測 |
| prefers-reduced-motion | アニメーション全停止のメディアクエリあり（モーションはヒーロー1箇所のみ） | CSS確認 |
| コントラスト | 本文 約12:1 / 補足 約6.9:1 / 朱ボタン白文字 約5.1:1 | 計算 |
| Webフォント | Shippori Mincho B1 の700のみ（1ウェイト）＋本文はシステムフォント | HTML/CSS確認 |
| 共通パーツの重複 | なし（build.mjs で一元管理、コピペなし） | 構成確認 |
| 法務 | 効果効能・No.1表記なし。実績・声の捏造なし（未支給のため掲載自体なし）。他者著作物なし（写真未使用・図版は自作SVG） | 全文確認 |

## 判定

**ドラフト納品: 可**（🔴はすべて「クライアント回答待ち」に起因する公開ブロッカーで、コード欠陥は0件）
**本番公開: 不可**（🔴 4件の消化が条件。delivery.md の公開前チェックリスト参照）
