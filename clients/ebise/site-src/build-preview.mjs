#!/usr/bin/env node
/**
 * 確認用プレビュー生成（クライアント/社内レビュー用・1ファイル完結）
 *
 * 本番の site/ とは別物。全ページを1つのHTMLにまとめ、リンククリックで
 * ページを切り替える。外部リクエストが遮断された環境（Artifact等）でも
 * 崩れないよう、Webフォント読込を省略し、地図はプレビュー表示に差し替える。
 * 使い方: node clients/ebise/site-src/build-preview.mjs → ../preview.html
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = dirname(fileURLToPath(import.meta.url));

/* build.mjs と同じ値（プレビューは独立ツールのため最小限を複製） */
const SITE = {
  telDisplay: "0256-XX-XXXX",
  telHref: "tel:0000000000",
  zip: "955-0047",
  address: "新潟県三条市東三条1丁目X-XX",
  hotpepper: "https://www.hotpepper.jp/strJ000334858/",
  hoursShort: "昼 11:00–14:30／夜 17:00–23:00（日・祝は22:00まで）",
  closed: "月曜定休",
  year: "2026",
};
const NAV = [
  { href: "/menu/", label: "お品書き" },
  { href: "/party/", label: "ご宴会" },
  { href: "/access/", label: "店舗案内" },
  { href: "/reserve/", label: "ご予約" },
];
const PAGES = [
  { src: "index.html", path: "/", crumb: null, cta: true },
  { src: "menu.html", path: "/menu/", crumb: "お品書き", cta: true },
  { src: "party.html", path: "/party/", crumb: "ご宴会・コース", cta: true },
  { src: "access.html", path: "/access/", crumb: "店舗案内・アクセス", cta: true },
  { src: "reserve.html", path: "/reserve/", crumb: "ご予約・お問い合わせ", cta: false },
  { src: "privacy.html", path: "/privacy/", crumb: "プライバシーポリシー", cta: false },
];

const css = readFileSync(join(SRC, "..", "site", "assets", "css", "style.css"), "utf8");
const js = readFileSync(join(SRC, "..", "site", "assets", "js", "main.js"), "utf8");

const fill = (html) =>
  html
    .replaceAll("{{TEL_DISPLAY}}", SITE.telDisplay)
    .replaceAll("{{TEL_HREF}}", SITE.telHref)
    .replaceAll("{{HOTPEPPER}}", SITE.hotpepper)
    .replaceAll("{{ZIP}}", SITE.zip)
    .replaceAll("{{ADDRESS}}", SITE.address)
    .replaceAll("{{HOURS}}", SITE.hoursShort)
    .replaceAll("{{CLOSED}}", SITE.closed);

const crumbs = (page) =>
  page.crumb
    ? `<nav class="crumbs section__in" aria-label="現在地"><ol><li><a href="/">トップ</a></li><li aria-current="page">${page.crumb}</li></ol></nav>`
    : "";

const ctaBlock = `
<section class="cta-block">
  <div class="section__in u-center">
    <h2>今夜の席、お取りします。</h2>
    <p class="cta-hours">${SITE.hoursShort}｜${SITE.closed}</p>
    <div class="btn-row">
      <a class="btn btn--primary" href="${SITE.telHref}">電話をかける（${SITE.telDisplay}）</a>
      <a class="btn btn--ghost-light" href="${SITE.hotpepper}" target="_blank" rel="noopener">ネット予約する<span class="ext" aria-hidden="true">↗</span></a>
    </div>
    <p class="u-note">宴会のご相談は<a href="/reserve/#form">フォーム</a>でも受け付けています。</p>
  </div>
</section>`;

const pageDivs = PAGES.map((page) => {
  let body = fill(readFileSync(join(SRC, "pages", page.src), "utf8")).trim();
  // 外部リクエスト遮断環境向け: 地図の iframe をプレビュー枠に差し替え
  body = body.replace(
    /<iframe class="map-embed"[\s\S]*?<\/iframe>/,
    '<div class="map-embed ph" style="aspect-ratio:16/9"><span>Googleマップが入ります<br>（本番サイトで表示されます）</span></div>'
  );
  return `<div class="page${page.path === "/" ? " is-active" : ""}" data-path="${page.path}">
${crumbs(page)}
<main>
${body}
</main>
${page.cta ? ctaBlock : ""}
</div>`;
}).join("\n");

const html = `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>海老勢HP ドラフト（確認用プレビュー）</title>
<style>
${css}
/* --- プレビュー専用 --- */
.preview-banner {
  background: #7A2318; color: #fff; font-size: 13px; letter-spacing: 0.06em;
  text-align: center; padding: 8px 16px;
}
.page { display: none; }
.page.is-active { display: block; }
</style>
<p class="preview-banner">確認用プレビュー｜制作中のドラフトです。電話番号・住所・価格（—）は仮の表記で、公開前に差し替えます。</p>
<header class="site-head">
  <div class="site-head__in">
    <a class="brand" href="/">
      <span class="sub">三条市東三条・JR東三条駅前</span>
      <span class="name">わいわい肴屋 海老勢</span>
    </a>
    <nav class="site-nav" aria-label="サイト内メニュー">
      <ul>
        ${NAV.map((i) => `<li><a href="${i.href}">${i.label}</a></li>`).join("\n        ")}
      </ul>
    </nav>
    <a class="btn btn--primary head-tel" href="${SITE.telHref}">電話をかける（${SITE.telDisplay}）</a>
  </div>
</header>
${pageDivs}
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
        ${NAV.map((i) => `<li><a href="${i.href}">${i.label}</a></li>`).join("\n        ")}
        <li><a href="/privacy/">プライバシーポリシー</a></li>
      </ul>
    </nav>
    <p class="copyright">© ${SITE.year} わいわい肴屋 海老勢</p>
  </div>
</footer>
<div class="mobile-bar">
  <a class="bar-tel" href="${SITE.telHref}">電話をかける</a>
  <a class="bar-net" href="${SITE.hotpepper}" target="_blank" rel="noopener">ネット予約する</a>
</div>
<script>
// プレビュー用ページ切り替え（サイト内リンクを疑似遷移に変換）
(() => {
  "use strict";
  const show = (path, hash) => {
    let found = false;
    document.querySelectorAll(".page").forEach((p) => {
      const active = p.dataset.path === path;
      p.classList.toggle("is-active", active);
      if (active) found = true;
    });
    if (!found) return;
    document.querySelectorAll('.site-nav a').forEach((a) => {
      if (a.getAttribute("href") === path) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (hash) {
      const target = document.querySelector(".page.is-active " + hash);
      if (target) { target.scrollIntoView(); return; }
    }
    window.scrollTo(0, 0);
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href.startsWith("/")) return;
    e.preventDefault();
    const [path, hash] = href.split("#");
    show(path, hash ? "#" + hash : "");
  });
  // プレビューではフォーム送信を成功として扱う（本番は Netlify Forms）
  const origFetch = window.fetch.bind(window);
  window.fetch = (url, opts) =>
    url === "/" && opts && opts.method === "POST"
      ? Promise.resolve({ ok: true })
      : origFetch(url, opts);
})();
</script>
<script>
${js}
</script>
`;

writeFileSync(join(SRC, "..", "preview.html"), html);
console.log("✔ clients/ebise/preview.html");
