#!/usr/bin/env node
/**
 * 海老勢 HP ビルドスクリプト（依存なし・Node 18+）
 *
 * 役割: 共通パーツ（ヘッダー／フッター／CTA／メタ情報）を1箇所で管理し、
 *       site-src/pages/ の本文フラグメントから ../site/ に完成HTMLを生成する。
 * 使い方: node clients/ebise/site-src/build.mjs
 *
 * 共通パーツを直すときはこのファイルだけを直し、再ビルドすること。
 * 生成物（../site/）を直接編集しない。
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = dirname(fileURLToPath(import.meta.url));
const OUT = join(SRC, "..", "site");

/* ------------------------------------------------------------------
 * サイト定数
 * ⚠ PLACEHOLDER と付く値は公開前に必ず差し替える（delivery.md の差し替え表）
 * ------------------------------------------------------------------ */
const SITE = {
  origin: "https://www.ebise.jp", // ⚠ 本番ドメイン要確認（questions.md #1,2）
  name: "わいわい肴屋 海老勢",
  shortName: "海老勢",
  telDisplay: "0256-XX-XXXX", // ⚠ PLACEHOLDER: 実番号に差し替え
  telHref: "tel:0000000000", // ⚠ PLACEHOLDER: tel:0256XXXXXX 形式で差し替え
  zip: "955-0047", // ⚠ 要確認
  address: "新潟県三条市東三条1丁目X-XX", // ⚠ PLACEHOLDER: 番地を差し替え
  hotpepper: "https://www.hotpepper.jp/strJ000334858/", // ⚠ 掲載継続を要確認
  hoursShort: "昼 11:00–14:30／夜 17:00–23:00（日・祝は22:00まで）", // ⚠ 要確認
  closed: "月曜定休", // ⚠ 要確認
  year: "2026",
};

const NAV = [
  { href: "/menu/", label: "お品書き" },
  { href: "/party/", label: "ご宴会" },
  { href: "/access/", label: "店舗案内" },
  { href: "/reserve/", label: "ご予約" },
];

/* ------------------------------------------------------------------
 * ページ定義（title 約30字 / description 約120字 は copy/ と同期）
 * ------------------------------------------------------------------ */
const PAGES = [
  {
    src: "index.html",
    out: "index.html",
    path: "/",
    title: "わいわい肴屋 海老勢｜東三条駅前の居酒屋・ご宴会（三条市）",
    description:
      "三条市・JR東三条駅から徒歩1分の居酒屋「海老勢（えびせ）」。毎日市場で買い付ける魚と、全品個別盛りの宴会コース。2時間飲み放題は4名様から。ランチ営業あり、月曜定休。",
    crumb: null,
    cta: true,
    home: true,
  },
  {
    src: "menu.html",
    out: "menu/index.html",
    path: "/menu/",
    title: "お品書き｜わいわい肴屋 海老勢（三条市東三条）",
    description:
      "海老勢のお品書き。昼は定食・丼・カレーラーメン、夜は毎日市場で買い付ける魚の刺身や焼き物、一品料理と酒。お品書きは仕入れで変わります。三条市・東三条駅から徒歩1分。",
    crumb: "お品書き",
    cta: true,
  },
  {
    src: "party.html",
    out: "party/index.html",
    path: "/party/",
    title: "ご宴会・コース｜海老勢（三条市・東三条駅前）",
    description:
      "三条市で宴会なら東三条駅前の海老勢へ。コース料理は全品個別盛りで、取り分け不要。2時間飲み放題付きコースは4名様から。駅から徒歩1分、お車は専用駐車場へ。",
    crumb: "ご宴会・コース",
    cta: true,
  },
  {
    src: "access.html",
    out: "access/index.html",
    path: "/access/",
    title: "店舗案内・アクセス｜海老勢（JR東三条駅から徒歩1分）",
    description:
      "海老勢はJR東三条駅から徒歩1分、駅前の居酒屋です。専用駐車場あり。営業時間・定休日・地図・駐車場のご案内と、姉妹店「海茶屋」・運営会社のご紹介。",
    crumb: "店舗案内・アクセス",
    cta: true,
  },
  {
    src: "reserve.html",
    out: "reserve/index.html",
    path: "/reserve/",
    title: "ご予約・お問い合わせ｜海老勢（三条市東三条）",
    description:
      "海老勢のご予約はお電話がいちばん早く確実です。ネット予約にも対応。宴会のご相談はフォームでも受け付けており、翌営業日までにご連絡します。営業のお電話はいたしません。",
    crumb: "ご予約・お問い合わせ",
    cta: false,
  },
  {
    src: "privacy.html",
    out: "privacy/index.html",
    path: "/privacy/",
    title: "プライバシーポリシー｜海老勢",
    description:
      "わいわい肴屋 海老勢のプライバシーポリシー。ご予約・お問い合わせフォームでお預かりする個人情報の利用目的と取り扱いについてご案内します。",
    crumb: "プライバシーポリシー",
    cta: false,
  },
  {
    src: "404.html",
    out: "404.html",
    path: "/404.html",
    title: "ページが見つかりません｜海老勢",
    description: "お探しのページが見つかりませんでした。わいわい肴屋 海老勢（三条市東三条）のサイトへご案内します。",
    crumb: "ページが見つかりません",
    cta: false,
    noindex: true, // 404ページのみ。それ以外に noindex を置かないこと
  },
];

/* ------------------------------------------------------------------
 * 共通パーツ
 * ------------------------------------------------------------------ */
const header = (page) => `
<header class="site-head">
  <div class="site-head__in">
    <a class="brand" href="/">
      <span class="sub">三条市東三条・JR東三条駅前</span>
      <span class="name">わいわい肴屋 海老勢</span>
    </a>
    <nav class="site-nav" aria-label="サイト内メニュー">
      <ul>
        ${NAV.map(
          (item) =>
            `<li><a href="${item.href}"${page.path === item.href ? ' aria-current="page"' : ""}>${item.label}</a></li>`
        ).join("\n        ")}
      </ul>
    </nav>
    <a class="btn btn--primary head-tel" href="${SITE.telHref}">電話をかける（${SITE.telDisplay}）</a>
  </div>
</header>`;

const crumbs = (page) =>
  page.crumb
    ? `
<nav class="crumbs section__in" aria-label="現在地">
  <ol>
    <li><a href="/">トップ</a></li>
    <li aria-current="page">${page.crumb}</li>
  </ol>
</nav>`
    : "";

const ctaBlock = `
<section class="cta-block" aria-labelledby="cta-title">
  <div class="section__in u-center">
    <h2 id="cta-title">今夜の席、お取りします。</h2>
    <p class="cta-hours">${SITE.hoursShort}｜${SITE.closed}</p>
    <div class="btn-row">
      <a class="btn btn--primary" href="${SITE.telHref}">電話をかける（${SITE.telDisplay}）</a>
      <a class="btn btn--ghost-light" href="${SITE.hotpepper}" target="_blank" rel="noopener">ネット予約する<span class="ext" aria-hidden="true">↗</span></a>
    </div>
    <p class="u-note">宴会のご相談は<a href="/reserve/#form">フォーム</a>でも受け付けています。</p>
  </div>
</section>`;

const footer = `
<footer class="site-foot">
  <div class="site-foot__in">
    <div>
      <p class="name">わいわい肴屋 海老勢</p>
      <p>〒${SITE.zip} ${SITE.address}<br>
      電話: <a href="${SITE.telHref}">${SITE.telDisplay}</a><br>
      ${SITE.hoursShort}<br>
      ${SITE.closed}（最新の営業情報はお電話でご確認ください）</p>
      <p>姉妹店: 海茶屋（三条市東三条）／運営: 株式会社ゑびせ</p>
    </div>
    <nav class="foot-nav" aria-label="フッターメニュー">
      <ul>
        <li><a href="/">トップ</a></li>
        ${NAV.map((item) => `<li><a href="${item.href}">${item.label}</a></li>`).join("\n        ")}
        <li><a href="/privacy/">プライバシーポリシー</a></li>
      </ul>
    </nav>
    <p class="copyright">© ${SITE.year} ${SITE.name}</p>
  </div>
</footer>
<div class="mobile-bar">
  <a class="bar-tel" href="${SITE.telHref}">電話をかける</a>
  <a class="bar-net" href="${SITE.hotpepper}" target="_blank" rel="noopener">ネット予約する</a>
</div>`;

/* 構造化データ: トップは Restaurant、下層は BreadcrumbList */
const jsonLd = (page) => {
  if (page.home) {
    // ⚠ telephone / streetAddress は PLACEHOLDER。公開前に差し替え
    return `<script type="application/ld+json">
${JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: SITE.name,
    alternateName: "海老勢",
    url: `${SITE.origin}/`,
    telephone: "+81-256-XX-XXXX",
    servesCuisine: ["居酒屋", "海鮮料理"],
    acceptsReservations: true,
    address: {
      "@type": "PostalAddress",
      postalCode: SITE.zip,
      addressRegion: "新潟県",
      addressLocality: "三条市",
      streetAddress: "東三条1丁目X-XX",
    },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "11:00", closes: "14:30" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "17:00", closes: "23:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "11:00", closes: "14:30" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "17:00", closes: "22:00" },
    ],
    parentOrganization: { "@type": "Organization", name: "株式会社ゑびせ" },
  },
  null,
  2
)}
</script>`;
  }
  return `<script type="application/ld+json">
${JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "トップ", item: `${SITE.origin}/` },
      { "@type": "ListItem", position: 2, name: page.crumb, item: `${SITE.origin}${page.path}` },
    ],
  },
  null,
  2
)}
</script>`;
};

const layout = (page, body) => `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${page.title}</title>
<meta name="description" content="${page.description}">
${page.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${SITE.origin}${page.path}">`}
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${page.title}">
<meta property="og:description" content="${page.description}">
<meta property="og:url" content="${SITE.origin}${page.path}">
<meta property="og:type" content="website">
<meta property="og:image" content="${SITE.origin}/og.png">
<meta property="og:locale" content="ja_JP">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.css">
<!-- ⚠ 電話番号・住所はプレースホルダ。公開前に delivery.md の差し替え表を必ず消化すること -->
${jsonLd(page)}
</head>
<body>
<a class="skip-link" href="#main">本文へ進む</a>
${header(page)}
${crumbs(page)}
<main id="main">
${body}
</main>
${page.cta ? ctaBlock : ""}
${footer}
<script src="/assets/js/main.js" defer></script>
</body>
</html>
`;

/* ------------------------------------------------------------------
 * 生成
 * ------------------------------------------------------------------ */
const fill = (html) =>
  html
    .replaceAll("{{TEL_DISPLAY}}", SITE.telDisplay)
    .replaceAll("{{TEL_HREF}}", SITE.telHref)
    .replaceAll("{{HOTPEPPER}}", SITE.hotpepper)
    .replaceAll("{{ZIP}}", SITE.zip)
    .replaceAll("{{ADDRESS}}", SITE.address)
    .replaceAll("{{HOURS}}", SITE.hoursShort)
    .replaceAll("{{CLOSED}}", SITE.closed);

for (const page of PAGES) {
  const fragment = readFileSync(join(SRC, "pages", page.src), "utf8");
  const html = layout(page, fill(fragment).trim());
  const outPath = join(OUT, page.out);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html);
  console.log(`✔ ${page.out}`);
}

/* sitemap.xml（404は除外） */
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.filter((p) => !p.noindex)
  .map((p) => `  <url><loc>${SITE.origin}${p.path}</loc></url>`)
  .join("\n")}
</urlset>
`;
writeFileSync(join(OUT, "sitemap.xml"), sitemap);
console.log("✔ sitemap.xml");

console.log(
  "\n⚠ 公開前チェック: 電話番号・住所・ドメインがプレースホルダのままです。delivery.md の差し替え表を消化してから公開してください。"
);
