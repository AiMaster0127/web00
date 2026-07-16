# 納品サマリ — 海老勢 HP（ドラフト版）

> 状態: **ヒアリング回答前のドラフト。** 構成・デザイン・文章はクライアント確認用に完成。
> 公開は下記「公開前チェックリスト」の消化が条件。

## 納品物

```
clients/ebise/
├── brief.md            案件ブリーフ（依頼原文 + 調査メモ）
├── requirements.md     要件定義（★は仮定）
├── questions.md        クライアント確認事項（そのまま送れる形）
├── sitemap.md          情報設計（サイトマップ・導線・301対応表）
├── design-plan.md      デザイン設計（トークン・共通パーツ・ワイヤー）
├── copy/               各ページ原稿（title / meta description 込み）
├── assets-request.md   素材依頼書・撮影指示書（そのまま送れる形）
├── qa-report.md        検品レポート
├── site-src/           ビルドスクリプトとページ本文（編集はこちら）
└── site/               ★納品物本体（生成済み・そのまま置けば動く静的サイト）
```

- ページ構成: トップ / お品書き / ご宴会・コース / 店舗案内・アクセス / ご予約・お問い合わせ / プライバシーポリシー / 404
- 技術構成: **静的HTML/CSS/JS（フレームワークなし・依存ゼロ）**。共通パーツは `site-src/build.mjs` で一元管理
- 対応済み: レスポンシブ（375px〜）／キーボードフォーカス可視／`prefers-reduced-motion`／OGP／sitemap.xml／robots.txt／構造化データ（Restaurant・パンくず）／モバイル電話・予約追従バー

## 🔴 公開前チェックリスト（この順に消化）

1. **ドメイン・サーバー管理者の確認**（questions.md #1）。`ebise.jp` を新サイトに向けられるか
2. **旧サイトの全URL洗い出し** → `site/_redirects`（Netlify）と `site/vercel.json` の301対応表を完成させる
   - 現在は判明分のみ: `/access.html` `/ebise_menu.html` `/ebise_corsemenu.html`
3. **実データへの差し替え**（`site-src/build.mjs` の `SITE` 定数を書き換え → 再ビルド）
   - `telDisplay` / `telHref`（現在 0256-XX-XXXX / tel:0000000000）
   - `address`（番地 X-XX）、`zip`、`origin`（本番ドメイン）
   - 構造化データの telephone / streetAddress は同スクリプトが自動反映
4. 営業時間・定休日・こだわり表記の裏取り（questions.md #4, #12）
5. メニュー・コース価格の掲載（現在「—」。**価格掲載は集客に直結**）
6. 写真の差し替え（`assets-request.md` を送付済みの想定。`.ph` スロットを実写に）
7. フォームの本番テスト（下記）と、プライバシーポリシーの制定日記入
8. `qa-report.md` の🔴が消えたことを確認して公開

## デプロイ手順

### Netlify（推奨: フォームがそのまま動く）

```bash
# clients/ebise/site をそのまま公開ディレクトリに指定するだけ
# CLIなら:
npx netlify-cli deploy --dir clients/ebise/site --prod
```

- `_redirects` による301、フォーム（Netlify Forms）が追加設定なしで有効
- フォーム通知: Netlify管理画面 → Forms → party-consult → 通知先メールを店舗に設定
- スパム対策: ハニーポット実装済み + Netlify側のフィルタ。送信テストを1回実施すること

### Vercel / Cloudflare Pages の場合

- 301は `vercel.json` 反映済み（Cloudflare Pagesは `_redirects` をそのまま読む）
- **フォームは Netlify Forms 前提のため差し替えが必要**（Formspree等の外部フォーム or Workers/Functions）。差し替えるまでフォームセクションを非表示にする選択も可

### 既存サーバー（Apache）に置く場合の301

```apache
Redirect 301 /access.html          /access/
Redirect 301 /ebise_menu.html      /menu/
Redirect 301 /ebise_corsemenu.html /party/
```

## 更新方法（制作側）

```bash
# 1. 文章・構成の変更: site-src/pages/*.html と build.mjs（共通部）を編集
# 2. 再ビルド:
node clients/ebise/site-src/build.mjs
# 3. site/ を再デプロイ
```

- **生成物（site/*.html）を直接編集しない。** 次のビルドで消える
- CSS/JS は `site/assets/` を直接編集してよい（ビルド対象外）

## スコープ外（今回やっていないこと）

- お知らせ・ブログ機能（更新主体が未確認のため。運用意思の確認後に Instagram埋め込み or 更新代行で対応）
- 海茶屋の単独ページ群（掲載範囲未確認。店舗案内内の言及のみ）
- 採用ページ・多言語・テイクアウト/通販
- ロゴ制作・写真撮影（素材支給待ち。撮影指示書は `assets-request.md`）
- ドメイン移管・サーバー契約の代行（管理者確認後に別途）
- アクセス解析（GA4）・Search Console 登録

## 保守のご提案（納品時に必ず添える）

> 公開後の更新や、機能の追加（お知らせの更新・アクセス解析・写真の入れ替えなど）も対応できます。
> 月次の保守（メニュー・価格の改定反映、営業時間の変更、バックアップ、表示の不具合対応）は**月5,000〜10,000円**で承っています。
> 特に飲食店は「ネット上の営業時間が古い」ことが機会損失に直結するため、月次での見直しをおすすめします。

- 追加機能の提案候補: 季節コースの特集枠（宴会シーズン前の更新）、Instagram連携、Googleビジネスプロフィールの整備（地図検索対策。集客目的なら費用対効果が最も高い施策のひとつ）

## 修正について

- 修正はドラフト確認後2回まで（見積り時に合意の想定。questions.md #17-18 で条件を握ること）
