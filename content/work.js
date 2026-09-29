const works = [
  {
    id: "docx",
    href: "service-docx.html",
    home: true,
    tag: "01 · Documents",
    title: "Translations preserving docx structure",
    image: "images/technical-translation-review.webp",
    alt: "Technical translation review with source and translated terms",
    paragraphs: [
      "Translating big docx manuals is a tedious, expensive and error prone process. Translators often copy paste paragraphs to chatgpt and re-paste them back. This app does the copy pasting for you while maintaining the docx structure (tables, paragraphs…), 3000 times a document, for just a few euros per document online or locally if you want more privacy and you don’t mind a bigger upfront cost. You can have your company glossary and check the results with error detection systems.",
    ],
    note: "numbers are based on real 100 page documents tested manually",
  },
  {
    id: "workflows",
    href: "service-workflows.html",
    home: true,
    tag: "02 · Operations",
    title: "Custom app for documents (word, excel, pdf, eplan)",
    image: "images/excel-approval-workflow.webp",
    alt: "Custom app for company documents: Word, Excel, PDF, and Eplan",
    photoClass: "photo-interface",
    paragraphs: [
      "Custom built webapp for repetitive interactions with the company knowledge base. What this means is going from the question to the paragraph of the best fitting document in a few seconds. With preview.",
      "There is also wide support for excel file modification and analysis. And work in progress eplan parsing and search.",
    ],
  },
  {
    id: "avionics",
    href: "project-avionics.html",
    home: true,
    tag: "03 · Avionics",
    title: "Everything a pilot needs, in front of his eyes. Custom built.",
    image: "images/aviation-hud-prototype.webp",
    alt: "General aviation head-up display prototype on a test bench",
    paragraphs: [
      "GPS speed, heading, altitude and inertial attitude. Flight plans can be made from the app and they are instantly transferred by Bluetooth to the HUD device.",
    ],
  },
  {
    id: "rockwell",
    href: "service-rockwell.html",
    home: true,
    tag: "04 · Controls",
    title: "Controls & automation",
    image: "images/studio-5000-l5x-automation.webp",
    alt: "Studio 5000 L5X automation interface",
    paragraphs: [
      "Saving time and errors in data entry by transforming any custom excel file exported from your electrical schemas into perfect plc code to easily import into the app",
    ],
  },
  {
    id: "local-ai",
    href: "service-local-ai.html",
    home: true,
    tag: "05 · Local AI",
    title: "Local AI systems",
    image: "images/local-ai-vllm-platform.webp",
    alt: "Local AI inference platform running on company-controlled hardware",
    paragraphs: [
      "Keep your data private by using an AI that is self hosted INSIDE of your company network.",
    ],
    note: "this is expensive and definitely not for everyone. It can be done after a quick study to decide if it's worth it for the privacy improvements.",
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function proseHtml(item) {
  const blocks = item.paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`);
  if (item.note) blocks.push(`<p><strong>Note:</strong> ${escapeHtml(item.note)}</p>`);
  return blocks.join("\n");
}

function homeCard(item) {
  const figureClass = ["photo", item.photoClass].filter(Boolean).join(" ");
  const prose = proseHtml(item)
    .split("\n")
    .map((line) => `          ${line}`)
    .join("\n");
  return `      <article class="card work-card is-open" data-href="${item.href}" tabindex="0" aria-expanded="true">
        <div class="card-body">
          <span class="tag">${escapeHtml(item.tag)}</span>
          <h3>${escapeHtml(item.title)}</h3>
        </div>
        <figure class="${figureClass}">
          <img src="${item.image}" alt="${escapeHtml(item.alt)}" loading="lazy" decoding="async">
        </figure>
        <div class="card-expand">
${prose}
        </div>
      </article>`;
}

function homeCardsHtml() {
  return works.filter((item) => item.home).map(homeCard).join("\n");
}

function applyWorks(html) {
  let out = html.replaceAll("{{home-cards}}", homeCardsHtml());
  for (const item of works) {
    out = out
      .replaceAll(`{{work:${item.id}:prose}}`, proseHtml(item))
      .replaceAll(`{{work:${item.id}:src}}`, item.image)
      .replaceAll(`{{work:${item.id}:alt}}`, escapeHtml(item.alt))
      .replaceAll(`{{work:${item.id}:title}}`, escapeHtml(item.title))
      .replaceAll(`{{work:${item.id}:href}}`, item.href);
  }
  const leftover = out.match(/\{\{(?:home-cards|work:[^}]+)\}\}/);
  if (leftover) throw new Error(`Unresolved token ${leftover[0]}`);
  return out;
}

module.exports = { works, applyWorks };
