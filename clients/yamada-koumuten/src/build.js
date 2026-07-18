/**
 * 山田工務店サイト ビルドスクリプト（依存ゼロ・Node標準のみ）
 *
 * 共通パーツ（header / footer / base テンプレート）を単一ソースとして、
 * 各ページ（src/pages/*.html）へ差し込み、public/ に静的HTMLを出力する。
 * これにより「共通パーツを各ページにコピペしない」を実現する。
 *
 * 使い方: node src/build.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = __dirname;
const OUT = path.join(ROOT, 'public');

// 公開前に実ドメインへ差し替える（canonical / OGP / sitemap.xml で使用）
const SITE_URL = 'https://yamada-koumuten.example.com';

// ---- 会社情報（構造化データの単一ソース。公開前に【要確定】を確定） ----
const BIZ = {
  name: '山田工務店',
  description: '新潟県三条市の工務店。注文住宅とリフォームを、下請けに回さず自社の職人が施工します。創業1994年。',
  telephone: '+81-256-00-0000', // 要確定
  street: '○○1-2-3',           // 要確定
  city: '三条市',
  region: '新潟県',
  postalCode: '955-0000',        // 要確定
  areaServed: ['三条市', '燕市'],
  foundingDate: '1994',
};

const read = (p) => fs.readFileSync(p, 'utf8');

const base = read(path.join(SRC, 'templates', 'base.html'));
const header = read(path.join(SRC, 'partials', 'header.html'));
const footer = read(path.join(SRC, 'partials', 'footer.html'));

// ---- ページ定義 ----
const pages = [
  {
    file: 'index.html', nav: 'home', bodyClass: 'page-home', ogType: 'website',
    title: '山田工務店｜新潟県三条市の注文住宅・リフォーム',
    description: '新潟県三条市の工務店。注文住宅とリフォームを、下請けに回さず自社の職人が施工します。ご相談から引き渡しまで社長が担当。創業1994年、三条・燕エリアで対応。見積り相談は無料です。',
    breadcrumb: [],
  },
  {
    file: 'works.html', nav: 'works', bodyClass: 'page-works', ogType: 'website',
    title: '施工事例｜山田工務店（新潟県三条市の注文住宅・リフォーム）',
    description: '山田工務店の施工事例。新潟県三条市・燕エリアで手がけた注文住宅・リフォームの実例を、種別とエリア別にご紹介します。写真は自社施工の実物です。',
    breadcrumb: [{ name: '施工事例', file: 'works.html' }],
  },
  {
    file: 'company.html', nav: 'company', bodyClass: 'page-company', ogType: 'website',
    title: '会社概要｜山田工務店｜新潟県三条市の工務店',
    description: '山田工務店の会社概要。新潟県三条市、創業1994年。注文住宅・リフォームを自社の職人が施工します。所在地・営業時間・建設業許可などの会社情報。',
    breadcrumb: [{ name: '会社概要', file: 'company.html' }],
  },
  {
    file: 'recruit.html', nav: 'recruit', bodyClass: 'page-recruit', ogType: 'website',
    title: '採用情報｜山田工務店｜三条市で大工・現場スタッフ募集',
    description: '山田工務店の採用情報。新潟県三条市で大工・現場スタッフを募集。下請けに回さない自社施工だから、設計から仕上げまで一通りの技術が身につきます。未経験の相談も可。',
    breadcrumb: [{ name: '採用情報', file: 'recruit.html' }],
  },
  {
    file: 'contact.html', nav: 'contact', bodyClass: 'page-contact', ogType: 'website',
    title: 'お問い合わせ・見積り相談｜山田工務店（三条市）',
    description: '山田工務店へのお問い合わせ・見積り相談はこちら。注文住宅・リフォームのご相談、採用応募を電話またはフォームで受け付けています。見積り・相談は無料です。',
    breadcrumb: [{ name: 'お問い合わせ', file: 'contact.html' }],
  },
  {
    file: 'thanks.html', nav: '', bodyClass: 'page-thanks', ogType: 'website', noindex: true, excludeFromSitemap: true,
    title: '送信しました｜山田工務店',
    description: 'お問い合わせの送信が完了しました。',
    breadcrumb: [{ name: 'お問い合わせ', file: 'contact.html' }, { name: '送信しました', file: 'thanks.html' }],
  },
];

const canonicalOf = (file) => (file === 'index.html' ? SITE_URL + '/' : SITE_URL + '/' + file);

// ---- 構造化データ ----
function localBusinessLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    name: BIZ.name,
    description: BIZ.description,
    url: SITE_URL + '/',
    telephone: BIZ.telephone,
    image: SITE_URL + '/assets/img/ogp.svg',
    foundingDate: BIZ.foundingDate,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BIZ.street,
      addressLocality: BIZ.city,
      addressRegion: BIZ.region,
      postalCode: BIZ.postalCode,
      addressCountry: 'JP',
    },
    areaServed: BIZ.areaServed.map((a) => ({ '@type': 'City', name: a })),
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00', closes: '18:00',
    }],
    knowsAbout: ['注文住宅', 'リフォーム'],
  };
}

function websiteLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BIZ.name,
    url: SITE_URL + '/',
    inLanguage: 'ja',
  };
}

function breadcrumbLD(page) {
  const items = [{ name: 'ホーム', file: 'index.html' }, ...page.breadcrumb];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: canonicalOf(it.file),
    })),
  };
}

const ldScript = (obj) =>
  '<script type="application/ld+json">' + JSON.stringify(obj) + '</script>';

function structuredData(page) {
  const blocks = [ldScript(localBusinessLD())];
  if (page.nav === 'home') blocks.push(ldScript(websiteLD()));
  if (page.breadcrumb.length) blocks.push(ldScript(breadcrumbLD(page)));
  return blocks.join('\n');
}

// ---- パンくず（画面表示用） ----
function breadcrumbHtml(page) {
  if (!page.breadcrumb.length) return '';
  const crumbs = [{ name: 'ホーム', file: 'index.html' }, ...page.breadcrumb];
  const lis = crumbs.map((c, i) => {
    const isLast = i === crumbs.length - 1;
    if (isLast) {
      return `<li class="breadcrumb__item"><span aria-current="page">${c.name}</span></li>`;
    }
    return `<li class="breadcrumb__item"><a href="${c.file}">${c.name}</a></li>`;
  }).join('\n      ');
  return `<nav class="breadcrumb" aria-label="パンくずリスト">
  <div class="container">
    <ol class="breadcrumb__list">
      ${lis}
    </ol>
  </div>
</nav>`;
}

// ---- ナビの現在地表示 ----
function activeHeader(navKey) {
  if (!navKey) return header;
  return header.replace(
    new RegExp(`data-nav="${navKey}"`),
    `data-nav="${navKey}" aria-current="page" class="is-active"`
  );
}

// ---- 出力 ----
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

for (const page of pages) {
  const mainHtml = read(path.join(SRC, 'pages', page.file));
  const html = base
    .replace(/{{TITLE}}/g, page.title)
    .replace(/{{DESCRIPTION}}/g, page.description)
    .replace(/{{OG_TITLE}}/g, page.title)
    .replace(/{{OG_TYPE}}/g, page.ogType)
    .replace(/{{CANONICAL}}/g, canonicalOf(page.file))
    .replace(/{{SITE_URL}}/g, SITE_URL)
    .replace(/{{ROBOTS}}/g, page.noindex ? '<meta name="robots" content="noindex, nofollow">' : '')
    .replace(/{{BODY_CLASS}}/g, page.bodyClass)
    .replace(/{{STRUCTURED_DATA}}/g, structuredData(page))
    .replace(/{{HEADER}}/g, activeHeader(page.nav))
    .replace(/{{BREADCRUMB}}/g, breadcrumbHtml(page))
    .replace(/{{MAIN}}/g, mainHtml.trim())
    .replace(/{{FOOTER}}/g, footer);
  fs.writeFileSync(path.join(OUT, page.file), html);
  console.log('built', page.file);
}

// ---- sitemap.xml ----
const urls = pages
  .filter((p) => !p.excludeFromSitemap)
  .map((p) => `  <url><loc>${canonicalOf(p.file)}</loc></url>`)
  .join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap);
console.log('built sitemap.xml');

// ---- robots.txt ----
const robots = `User-agent: *
Allow: /
Disallow: /thanks.html

Sitemap: ${SITE_URL}/sitemap.xml
`;
fs.writeFileSync(path.join(OUT, 'robots.txt'), robots);
console.log('built robots.txt');

console.log('done.');
