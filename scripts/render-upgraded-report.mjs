import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const docsDir = path.join(rootDir, "docs");
const inputPath = path.join(docsDir, "student-result-system-project-report-upgraded.md");
const outputHtmlPath = path.join(docsDir, "student-result-system-project-report-upgraded.html");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInline(text) {
  const codeTokens = [];
  const tokenized = text.replace(/`([^`]+)`/g, (_, code) => {
    const token = `@@CODE_${codeTokens.length}@@`;
    codeTokens.push(`<code>${escapeHtml(code)}</code>`);
    return token;
  });

  let html = escapeHtml(tokenized);
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/@@CODE_(\d+)@@/g, (_, index) => codeTokens[Number(index)]);
  return html;
}

function fileToDataUri(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const mimeType =
    extension === ".png"
      ? "image/png"
      : extension === ".svg"
        ? "image/svg+xml"
      : extension === ".jpg" || extension === ".jpeg"
        ? "image/jpeg"
        : "application/octet-stream";

  const buffer = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

const figureMap = new Map([
  [
    "Insert the ER diagram here.",
    {
      alt: "Entity relationship diagram of the implemented public schema with derived reporting views shown separately",
      caption: "Figure 1. Entity relationship diagram of the implemented public PostgreSQL schema with derived reporting views.",
      imagePath: path.join(rootDir, "docs/student-result-system-erd.svg")
    }
  ],
  [
    "Insert the login screenshot here.",
    {
      alt: "Secure multi-role login screen",
      caption: "Figure 1. Secure academic login interface.",
      imagePath: path.join(rootDir, "public/images/img/image 1.png")
    }
  ],
  [
    "Insert the landing page screenshot here.",
    {
      alt: "Landing page and public system introduction",
      caption: "Figure 2. Public landing page introducing the platform.",
      imagePath: path.join(rootDir, "public/images/img/image.png")
    }
  ],
  [
    "Insert the add-student screenshot here.",
    {
      alt: "Add student page",
      caption: "Figure 2. Student data entry backed by multi-table creation.",
      imagePath: path.join(rootDir, "public/images/img/image 3.png")
    }
  ],
  [
    "Insert the mark-entry screenshot here.",
    {
      alt: "Teacher mark entry page",
      caption: "Figure 3. Mark entry using composite-key storage.",
      imagePath: path.join(rootDir, "public/images/img/image 5.png")
    }
  ],
  [
    "Insert the class performance matrix screenshot here.",
    {
      alt: "Class performance matrix report",
      caption: "Figure 4. Class performance matrix generated from SQL views.",
      imagePath: path.join(rootDir, "public/images/img/image 2.png")
    }
  ],
  [
    "Insert the student report screenshot here.",
    {
      alt: "Student result sheet report",
      caption: "Figure 5. Individual result sheet derived from stored marks.",
      imagePath: path.join(rootDir, "public/images/img/image 4.png")
    }
  ]
]);

function renderFigure(placeholder) {
  const config = figureMap.get(placeholder);

  if (!config) {
    return `<p>${renderInline(placeholder)}</p>`;
  }

  return `
    <figure class="figure">
      <img src="${fileToDataUri(config.imagePath)}" alt="${escapeHtml(config.alt)}" />
      <figcaption>${escapeHtml(config.caption)}</figcaption>
    </figure>
  `;
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line) {
  return parseTableRow(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function isBlockBoundary(line) {
  return (
    line.trim() === "" ||
    /^#{1,4}\s+/.test(line) ||
    /^```/.test(line) ||
    /^- /.test(line) ||
    /^\d+\.\s+/.test(line) ||
    /^\|.*\|$/.test(line.trim()) ||
    /^---+$/.test(line.trim())
  );
}

function renderMarkdown(markdown) {
  const bodyMarkdown = markdown
    .replace(/^# Student Academic Record Management System\s*\n\s*## .+\n\s*/m, "")
    .replace(/^### Abstract/m, "## Abstract");

  const lines = bodyMarkdown.split("\n");
  const html = [];
  let index = 0;
  let sectionOpen = false;

  while (index < lines.length) {
    const line = lines[index];

    if (line.trim() === "") {
      index += 1;
      continue;
    }

    if (/^```/.test(line)) {
      const language = line.trim().slice(3).trim();
      const codeLines = [];
      index += 1;

      while (index < lines.length && !/^```/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      html.push(
        `<pre><code${language ? ` class="language-${escapeHtml(language)}"` : ""}>${escapeHtml(codeLines.join("\n"))}</code></pre>`
      );
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = renderInline(headingMatch[2].trim());

      if (level === 2) {
        if (sectionOpen) {
          html.push("</section>");
        }

        html.push('<section class="report-section">');
        sectionOpen = true;
      }

      html.push(`<h${level}>${text}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      html.push("<hr />");
      index += 1;
      continue;
    }

    if (/^\|.*\|$/.test(line.trim())) {
      const tableLines = [];

      while (index < lines.length && /^\|.*\|$/.test(lines[index].trim())) {
        tableLines.push(lines[index]);
        index += 1;
      }

      const rows = tableLines.map(parseTableRow);
      const hasHeader = rows.length > 1 && isTableSeparator(tableLines[1]);
      const headerRow = hasHeader ? rows[0] : [];
      const bodyRows = hasHeader ? rows.slice(2) : rows;

      const tableHtml = [
        "<table>",
        hasHeader
          ? `<thead><tr>${headerRow
              .map((cell) => `<th>${renderInline(cell)}</th>`)
              .join("")}</tr></thead>`
          : "",
        `<tbody>${bodyRows
          .map(
            (row) =>
              `<tr>${row
                .map((cell, rowIndex) => `<${hasHeader ? "td" : rowIndex === 0 ? "th" : "td"}>${renderInline(cell)}</${hasHeader ? "td" : rowIndex === 0 ? "th" : "td"}>`)
                .join("")}</tr>`
          )
          .join("")}</tbody>`,
        "</table>"
      ].join("");

      html.push(tableHtml);
      continue;
    }

    if (/^- /.test(line)) {
      const items = [];

      while (index < lines.length && /^- /.test(lines[index])) {
        items.push(lines[index].replace(/^- /, "").trim());
        index += 1;
      }

      html.push(`<ul>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];

      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, "").trim());
        index += 1;
      }

      html.push(`<ol>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ol>`);
      continue;
    }

    const paragraphLines = [];

    while (index < lines.length && !isBlockBoundary(lines[index])) {
      paragraphLines.push(lines[index].trimEnd());
      index += 1;
    }

    const paragraphText = paragraphLines
      .map((entry) => entry.trim())
      .filter(Boolean)
      .join(" ");

    if (!paragraphText) {
      continue;
    }

    if (figureMap.has(paragraphText)) {
      html.push(renderFigure(paragraphText));
      continue;
    }

    html.push(`<p>${renderInline(paragraphText)}</p>`);
  }

  if (sectionOpen) {
    html.push("</section>");
  }

  return html.join("\n");
}

const logoDataUri = fileToDataUri(path.join(rootDir, "public/images/img/haramaya.png"));
const markdown = readText(inputPath);
const reportHtml = renderMarkdown(markdown);

const fullHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Student Academic Record Management System - Database-Focused Report</title>
    <style>
      @page {
        size: A4;
        margin: 12.2mm 12.2mm 13.4mm;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: #fff;
        color: #111;
        font-family: "Times New Roman", Times, serif;
        font-size: 10.5pt;
        line-height: 1.355;
      }

      main {
        max-width: 210mm;
        margin: 0 auto;
        padding: 6mm 5.5mm 8mm;
      }

      h1,
      h2,
      h3,
      h4 {
        margin: 0 0 8px;
        font-weight: 700;
      }

      h1 {
        font-size: 21pt;
        text-align: center;
      }

      h2 {
        font-size: 14.2pt;
        border-bottom: 1px solid #222;
        padding-bottom: 3px;
      }

      h3 {
        font-size: 11.7pt;
        margin-top: 9px;
      }

      h4 {
        font-size: 10.9pt;
        margin-top: 8px;
      }

      p {
        margin: 0 0 5px;
        text-align: justify;
      }

      ul,
      ol {
        margin: 0 0 8px 20px;
        padding: 0;
      }

      li {
        margin-bottom: 2px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin: 6px 0 9px;
      }

      th,
      td {
        border: 1px solid #333;
        padding: 4px 5px;
        vertical-align: top;
      }

      th {
        background: #efefef;
        text-align: left;
      }

      pre {
        margin: 6px 0 9px;
        border: 1px solid #444;
        background: #fafafa;
        padding: 7px 8px;
        font-family: "Courier New", Courier, monospace;
        font-size: 8.9pt;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      code {
        font-family: "Courier New", Courier, monospace;
        font-size: 0.95em;
      }

      hr {
        border: 0;
        border-top: 1px solid #777;
        margin: 8px 0;
      }

      .cover-page {
        min-height: 252mm;
        page-break-after: always;
        break-after: page;
      }

      .cover-shell {
        position: relative;
        min-height: 252mm;
        display: flex;
        flex-direction: column;
        gap: 0;
        padding: 13mm 17mm 14mm;
        background: #fff;
        font-family: "Poppins", "Montserrat", Arial, sans-serif;
      }

      .cover-watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 122mm;
        opacity: 0.055;
        pointer-events: none;
      }

      .cover-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: 8mm;
      }

      .cover-identity {
        text-align: center;
      }

      .cover-image {
        display: block;
        width: 50mm;
        max-width: 50mm;
        margin: 0 auto 4mm;
      }

      .cover-heading {
        font-size: 21pt;
        line-height: 1.12;
        font-weight: 800;
        letter-spacing: 0.08em;
        margin: 0 0 3mm;
        text-transform: uppercase;
        color: #0e2018;
      }

      .cover-subheading {
        font-size: 11pt;
        line-height: 1.35;
        margin: 0;
        color: #2c3e36;
      }

      .cover-divider {
        border: 0;
        border-top: 1.25px solid #1d6a4b;
        margin: 0;
        opacity: 0.75;
      }

      .cover-title-panel {
        padding: 1mm 0;
        text-align: center;
      }

      .cover-title {
        margin: 0 0 3mm;
        font-size: 31pt;
        line-height: 1.08;
        text-align: center;
        color: #111;
        font-weight: 800;
      }

      .cover-subtitle {
        font-size: 10.4pt;
        margin: 0;
        font-style: normal;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        text-align: center;
        color: #1f5b42;
      }

      .cover-meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 5mm 12mm;
        margin: 0;
      }

      .cover-meta-item {
        padding: 0;
        border-bottom: 1px solid #cfdad4;
        padding-bottom: 2.2mm;
      }

      .cover-label {
        margin: 0 0 1.2mm;
        font-size: 9.2pt;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #2e6050;
        text-align: left;
      }

      .cover-value {
        margin: 0;
        font-size: 11.2pt;
        font-weight: 600;
        text-align: left;
        color: #111;
      }

      .cover-members-wrap {
        margin-top: 1mm;
      }

      .cover-members {
        list-style: none;
        margin: 0;
        padding: 0;
        border-top: 1px solid #9db7ab;
      }

      .cover-members li {
        margin: 0;
        padding: 2.1mm 0;
        border-bottom: 1px solid #d6e1dc;
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 5mm;
      }

      .cover-member-name {
        font-size: 10.6pt;
        font-weight: 500;
        color: #121212;
      }

      .cover-member-id {
        font-size: 10.2pt;
        font-weight: 700;
        color: #1d6a4b;
        letter-spacing: 0.02em;
      }

      .report-section {
        page-break-before: auto;
        break-before: auto;
      }

      .figure {
        margin: 8px 0 10px;
        border: 1px solid #444;
        padding: 6px;
        background: #fff;
        page-break-inside: avoid;
        break-inside: avoid;
      }

      .figure img {
        display: block;
        width: 100%;
        height: auto;
        border: 1px solid #bbb;
      }

      .figure figcaption {
        margin-top: 5px;
        font-size: 9.4pt;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="cover-page">
        <div class="cover-shell">
          <img class="cover-watermark" src="${logoDataUri}" alt="" aria-hidden="true" />

          <div class="cover-content">
            <div class="cover-identity">
              <img class="cover-image" src="${logoDataUri}" alt="Haramaya University logo" />
              <p class="cover-heading">HARAMAYA UNIVERSITY</p>
              <p class="cover-subheading">College of Computing and Informatics</p>
              <p class="cover-subheading">Department of Software Engineering</p>
            </div>

            <hr class="cover-divider" />

            <div class="cover-title-panel">
              <h1 class="cover-title">Student Academic Record Management System</h1>
              <p class="cover-subtitle">Software Engineering Project Report</p>
            </div>

            <hr class="cover-divider" />

            <section class="cover-meta-grid">
              <div class="cover-meta-item">
                <p class="cover-label">Course</p>
                <p class="cover-value">Advanced Database</p>
              </div>
              <div class="cover-meta-item">
                <p class="cover-label">Instructor</p>
                <p class="cover-value">Mr Gizacho B.</p>
              </div>
              <div class="cover-meta-item">
                <p class="cover-label">Submission Date</p>
                <p class="cover-value">April 2026</p>
              </div>
            </section>

            <section class="cover-members-wrap">
              <p class="cover-label">Group Members</p>
              <ul class="cover-members">
                <li><span class="cover-member-name">Chala Gobena</span><span class="cover-member-id">0964/16</span></li>
                <li><span class="cover-member-name">Amenti Liben</span><span class="cover-member-id">0686/16</span></li>
                <li><span class="cover-member-name">Boka Jirenga</span><span class="cover-member-id">0931/16</span></li>
                <li><span class="cover-member-name">Damoze Motuma</span><span class="cover-member-id">0959/16</span></li>
                <li><span class="cover-member-name">Jalane Feyisa</span><span class="cover-member-id">1663/16</span></li>
                <li><span class="cover-member-name">Dawit Marsha</span><span class="cover-member-id">1026/16</span></li>
              </ul>
            </section>

          </div>
        </div>
      </section>

      ${reportHtml}
    </main>
  </body>
</html>
`;

fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(outputHtmlPath, fullHtml);

console.log(`Generated ${path.relative(rootDir, outputHtmlPath)}`);
