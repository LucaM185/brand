const fs = require("fs");
const path = require("path");

const site = {
  name: "Artificial Systems",
  tagline: "Industrial workflows",
  email: "hello@artificialsystems.example",
};

const pages = [
  {
    file: "index.html",
    title: "{{name}} — Industrial workflows",
    description:
      "Workflow optimization for manufacturing companies, Rockwell PLC projects, document research, and local AI that stays inside the company.",
    nav: "home",
  },
  {
    file: "about.html",
    title: "About — {{name}}",
    description:
      "An engineering practice for manufacturing workflows, industrial documents, local AI, and general aviation head-up displays.",
    nav: "about",
  },
  {
    file: "services.html",
    title: "Services — {{name}}",
    description:
      "Manufacturing workflows, document research, DOCX translation from a company glossary, local AI, Rockwell PLC projects, automatic workflows, and Excel rebuilt as applications.",
    nav: "services",
  },
  {
    file: "service-manufacturing.html",
    title: "Manufacturing workflows — {{name}}",
    description:
      "Workflow optimization for manufacturing companies: planning, the line, quality, and the handoffs between them.",
    nav: "services",
    sub: "service-manufacturing",
  },
  {
    file: "service-documents.html",
    title: "Document research — {{name}}",
    description:
      "Advanced document research across Word, Excel, Eplan, and email, kept inside the company.",
    nav: "services",
    sub: "service-documents",
  },
  {
    file: "service-docx.html",
    title: "DOCX translation — {{name}}",
    description:
      "Translate Word documents in place. Headings, tables, and styles stay. Terms follow the company glossary.",
    nav: "services",
    sub: "service-docx",
  },
  {
    file: "service-local-ai.html",
    title: "Local AI — {{name}}",
    description:
      "Local AI inside your company: models and document search that stay on hardware you control.",
    nav: "services",
    sub: "service-local-ai",
  },
  {
    file: "service-rockwell.html",
    title: "Rockwell PLC workflows — {{name}}",
    description:
      "Workflow optimization for Rockwell PLC projects: revisions, downloads, alarms, and the documents around the controller.",
    nav: "services",
    sub: "service-rockwell",
  },
  {
    file: "service-workflows.html",
    title: "Automatic workflows — {{name}}",
    description:
      "Automatic workflows with an explicit trigger, a rule people can read, and a log when something fails.",
    nav: "services",
    sub: "service-workflows",
  },
  {
    file: "service-excel.html",
    title: "Excel to applications — {{name}}",
    description:
      "Turn the spreadsheet that became your system of record into an application, and keep an export when a sheet is still needed.",
    nav: "services",
    sub: "service-excel",
  },
  {
    file: "competencies.html",
    title: "Competencies — {{name}}",
    description:
      "Operations, technical documents, on-premise software, Rockwell control systems, and general aviation displays.",
    nav: "competencies",
  },
  {
    file: "projects.html",
    title: "Projects — {{name}}",
    description:
      "Manufacturing, documents, local AI, Rockwell workflows, applications, and general aviation head-up displays.",
    nav: "projects",
  },
  {
    file: "project-avionics.html",
    title: "General aviation head-up displays — {{name}}",
    description:
      "Advanced avionics for general aviation head-up displays: symbology, readability, and installation in light aircraft.",
    nav: "projects",
    sub: "project-avionics",
  },
  {
    file: "project-other.html",
    title: "Other projects — {{name}}",
    description:
      "Commissioning tools, one-off applications, and technical studies outside the main lines of work.",
    nav: "projects",
    sub: "project-other",
  },
  {
    file: "partners.html",
    title: "Partners — {{name}}",
    description:
      "Partner marks and the platforms the work runs on: Rockwell, Word, Excel, Eplan, and email.",
    nav: "partners",
  },
  {
    file: "contact.html",
    title: "Contact — {{name}}",
    description:
      "Describe the workflow you want to change. Manufacturing, documents, a Rockwell project, a workbook, or a display.",
    nav: "contact",
  },
];

function writeWaves() {
  const width = 1600;
  const height = 900;
  const cell = 5;
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);

  function hash(ix, iy) {
    let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  }

  function noise(x, y) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const v00 = hash(x0, y0);
    const v10 = hash(x0 + 1, y0);
    const v01 = hash(x0, y0 + 1);
    const v11 = hash(x0 + 1, y0 + 1);
    return (
      v00 * (1 - sx) * (1 - sy) +
      v10 * sx * (1 - sy) +
      v01 * (1 - sx) * sy +
      v11 * sx * sy
    );
  }

  function fbm(x, y) {
    return noise(x, y) * 0.56 + noise(x * 2.05 + 4, y * 2.05) * 0.3 + noise(x * 4.1, y * 4.1 + 2) * 0.14;
  }

  // Long ridges bent by a slow warp. Where the warp turns back, a gyrus hooks.
  // Contours stay locally parallel, with a groove between opposing ridges.
  function cortex(x, y) {
    const n1 = fbm(x * 0.00215 + 0.3, y * 0.00225);
    const n2 = fbm(x * 0.00215 + 5.5, y * 0.00225 + 2.2);
    const px = x * 0.0105 + (n1 - 0.5) * 6.4;
    const py = y * 0.0092 + (n2 - 0.5) * 5.6;
    const fold = Math.sin(px * 3.15 + Math.sin(py) * 1.55);
    const cross = Math.sin(py * 2.55 + Math.sin(px * 0.75) * 1.25);
    return fold * 0.7 + cross * 0.3;
  }

  const grid = [];
  for (let j = 0; j <= rows; j++) {
    const row = new Float64Array(cols + 1);
    const y = j * cell;
    for (let i = 0; i <= cols; i++) row[i] = cortex(i * cell, y);
    grid.push(row);
  }

  function edgePoint(vA, vB, level, ax, ay, bx, by) {
    const denom = vB - vA;
    const t = denom === 0 ? 0.5 : (level - vA) / denom;
    const u = t < 0 ? 0 : t > 1 ? 1 : t;
    return [ax + (bx - ax) * u, ay + (by - ay) * u];
  }

  function contours(level) {
    const segments = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const x = i * cell;
        const y = j * cell;
        const tl = grid[j][i];
        const tr = grid[j][i + 1];
        const br = grid[j + 1][i + 1];
        const bl = grid[j + 1][i];
        let idx = 0;
        if (bl > level) idx |= 1;
        if (br > level) idx |= 2;
        if (tr > level) idx |= 4;
        if (tl > level) idx |= 8;
        if (idx === 0 || idx === 15) continue;

        const pts = [
          () => edgePoint(tl, tr, level, x, y, x + cell, y),
          () => edgePoint(tr, br, level, x + cell, y, x + cell, y + cell),
          () => edgePoint(bl, br, level, x, y + cell, x + cell, y + cell),
          () => edgePoint(tl, bl, level, x, y, x, y + cell),
        ];
        const key = (side) => {
          if (side === 0) return `h${i},${j}`;
          if (side === 1) return `v${i + 1},${j}`;
          if (side === 2) return `h${i},${j + 1}`;
          return `v${i},${j}`;
        };
        const centerIn = (tl + tr + br + bl) / 4 > level;
        let pairs;
        switch (idx) {
          case 1: pairs = [[3, 2]]; break;
          case 2: pairs = [[2, 1]]; break;
          case 3: pairs = [[3, 1]]; break;
          case 4: pairs = [[0, 1]]; break;
          case 5: pairs = centerIn ? [[0, 3], [1, 2]] : [[0, 1], [3, 2]]; break;
          case 6: pairs = [[0, 2]]; break;
          case 7: pairs = [[0, 3]]; break;
          case 8: pairs = [[3, 0]]; break;
          case 9: pairs = [[0, 2]]; break;
          case 10: pairs = centerIn ? [[0, 1], [2, 3]] : [[0, 3], [1, 2]]; break;
          case 11: pairs = [[0, 1]]; break;
          case 12: pairs = [[3, 1]]; break;
          case 13: pairs = [[1, 2]]; break;
          default: pairs = [[2, 3]];
        }
        for (const [s0, s1] of pairs) {
          segments.push({ aKey: key(s0), aPt: pts[s0](), bKey: key(s1), bPt: pts[s1]() });
        }
      }
    }
    return stitch(segments);
  }

  function stitch(segments) {
    const adj = new Map();
    segments.forEach((seg, index) => {
      for (const [from, toKey, toPt] of [
        [seg.aKey, seg.bKey, seg.bPt],
        [seg.bKey, seg.aKey, seg.aPt],
      ]) {
        if (!adj.has(from)) adj.set(from, []);
        adj.get(from).push({ index, otherKey: toKey, otherPt: toPt });
      }
    });
    const used = new Uint8Array(segments.length);
    const lines = [];
    function walk(startKey) {
      const out = [];
      let key = startKey;
      for (let guard = 0; guard < segments.length + 2; guard++) {
        const next = (adj.get(key) || []).find((n) => !used[n.index]);
        if (!next) break;
        used[next.index] = 1;
        out.push(next.otherPt);
        key = next.otherKey;
      }
      return out;
    }
    for (let i = 0; i < segments.length; i++) {
      if (used[i]) continue;
      used[i] = 1;
      const line = walk(segments[i].aKey).reverse().concat([segments[i].aPt, segments[i].bPt], walk(segments[i].bKey));
      if (line.length >= 10) lines.push(line);
    }
    return lines;
  }

  function perpDist(p, a, b) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    if (len < 1e-6) return Math.hypot(p[0] - a[0], p[1] - a[1]);
    return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len;
  }

  function simplify(points, epsilon) {
    if (points.length < 3) return points;
    const keep = new Uint8Array(points.length);
    keep[0] = 1;
    keep[points.length - 1] = 1;
    const stack = [[0, points.length - 1]];
    while (stack.length) {
      const [s, e] = stack.pop();
      let maxDist = 0;
      let index = -1;
      for (let i = s + 1; i < e; i++) {
        const d = perpDist(points[i], points[s], points[e]);
        if (d > maxDist) {
          maxDist = d;
          index = i;
        }
      }
      if (index !== -1 && maxDist > epsilon) {
        keep[index] = 1;
        stack.push([s, index], [index, e]);
      }
    }
    const out = [];
    for (let i = 0; i < points.length; i++) if (keep[i]) out.push(points[i]);
    return out;
  }

  function chaikin(points) {
    const closed =
      Math.hypot(points[0][0] - points[points.length - 1][0], points[0][1] - points[points.length - 1][1]) < cell * 1.5;
    const src = closed ? points.slice(0, -1) : points;
    if (src.length < 3) return points;
    const out = [];
    if (!closed) out.push(src[0]);
    const limit = closed ? src.length : src.length - 1;
    for (let i = 0; i < limit; i++) {
      const a = src[i];
      const b = src[(i + 1) % src.length];
      out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      out.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    if (!closed) out.push(src[src.length - 1]);
    else out.push(out[0]);
    return out;
  }

  function arcLength(points) {
    let len = 0;
    for (let i = 1; i < points.length; i++) {
      len += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    }
    return len;
  }

  function pathData(points) {
    let d = "";
    for (let i = 0; i < points.length; i++) {
      d += `${i === 0 ? "M" : "L"}${points[i][0].toFixed(1)} ${points[i][1].toFixed(1)}`;
    }
    return d;
  }

  const levels = [
    { v: 0.34, stroke: "#D6D0C4", opacity: 0.42, width: 1.08 },
    { v: 0.52, stroke: "#6F8A7A", opacity: 0.58, width: 1.12 },
    { v: 0.7, stroke: "#D6D0C4", opacity: 0.62, width: 1.15 },
    { v: -0.34, stroke: "#D6D0C4", opacity: 0.42, width: 1.08 },
    { v: -0.52, stroke: "#D6D0C4", opacity: 0.55, width: 1.12 },
    { v: -0.7, stroke: "#6F8A7A", opacity: 0.7, width: 1.18 },
  ];

  const paths = [];
  for (const level of levels) {
    for (const line of contours(level.v)) {
      const smooth = simplify(chaikin(line), 1.2);
      if (arcLength(smooth) < 80) continue;
      paths.push(
        `<path d="${pathData(smooth)}" fill="none" stroke="${level.stroke}" stroke-width="${level.width}" stroke-linecap="round" stroke-linejoin="round" opacity="${level.opacity}"/>`
      );
    }
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none">
${paths.join("\n")}
</svg>
`;
  fs.mkdirSync("assets", { recursive: true });
  fs.writeFileSync(path.join("assets", "waves.svg"), svg);
}

function build() {
  writeWaves();
  const shell = fs.readFileSync("partials/shell.html", "utf8");
  const header = fs.readFileSync("partials/header.html", "utf8");
  const footer = fs.readFileSync("partials/footer.html", "utf8");
  const built = [];

  for (const page of pages) {
    const bodyPath = path.join("pages", page.file);
    if (!fs.existsSync(bodyPath)) {
      throw new Error(`Missing fragment: ${bodyPath}`);
    }
    let headerHtml = header;
    for (const key of [page.nav, page.sub]) {
      if (!key) continue;
      headerHtml = headerHtml.replaceAll(
        `data-nav="${key}"`,
        `data-nav="${key}" aria-current="page"`
      );
    }
    const body = fs.readFileSync(bodyPath, "utf8");
    let html = shell
      .replace("{{title}}", page.title)
      .replace("{{description}}", page.description)
      .replace("{{header}}", headerHtml)
      .replace("{{footer}}", footer)
      .replace("{{body}}", body);
    html = html
      .replaceAll("{{name}}", site.name)
      .replaceAll("{{tagline}}", site.tagline)
      .replaceAll("{{email}}", site.email);
    fs.writeFileSync(page.file, html);
    built.push(page.file);
  }

  const missing = [];
  for (const file of built) {
    const html = fs.readFileSync(file, "utf8");
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    for (const href of hrefs) {
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("#") ||
        href.startsWith("data:")
      ) {
        continue;
      }
      const clean = href.split("#")[0].split("?")[0];
      if (!clean) continue;
      if (!fs.existsSync(clean)) missing.push(`${file} -> ${href}`);
    }
  }

  if (missing.length) {
    console.error("Missing link targets:\n" + missing.join("\n"));
    process.exit(1);
  }
  console.log(`Built ${built.length} pages.`);
}

build();
