async function loadPaperIndex() {
const response = await fetch("./data/index.json");
if (!response.ok) {
throw new Error("Could not load data/index.json");
}
return response.json();
}

async function loadPaper(id) {
const response = await fetch(`./data/${id}.json`);
if (!response.ok) {
throw new Error(`Could not load JSON for ${id}`);
}
return response.json();
}

function safeText(value) {
if (value === null || value === undefined) return "";
return String(value)
.replace(/&/g, "&")
.replace(/</g, "<")
.replace(/>/g, ">")
.replace(/"/g, """)
.replace(/'/g, "'");
}

function renderRepoCell(repoUrl) {
if (!repoUrl) return "—";

return `     <a href="${safeText(repoUrl)}" target="_blank" rel="noopener noreferrer">
      repo     </a>
  `;
}

function renderPaperCell(paperPage) {
if (!paperPage) return "—";

return `<a href="${safeText(paperPage)}">note</a>`;
}

function renderStatusCell(status) {
if (!status) return "—";
return `<span class="status">${safeText(status)}</span>`;
}

function renderEngagementCell(engagement) {
if (engagement === "five") {
return `<span class="engaged">five 🔥</span>`;
}

return `<a href="lift5.html" class="zero-link">zero</a>`;
}

function buildSearchText(paper) {
const fields = [
paper.id,
paper.title,
paper.area,
paper.date,
paper.bridge_note,
paper.status,
paper.engagement,
paper.engagement_detail,
...(paper.tags || [])
];

return fields
.filter(Boolean)
.join(" ")
.toLowerCase();
}

function renderRows(papers) {
const tbody = document.getElementById("papersBody");

if (!papers.length) {
tbody.innerHTML = `       <tr>         <td colspan="7">No matching papers.</td>       </tr>
    `;
return;
}

tbody.innerHTML = papers.map((paper) => {
const titleHtml = `      <strong>${safeText(paper.title)}</strong>
      ${paper.bridge_note ?`<div class="note">${safeText(paper.bridge_note)}</div>`: ""}
   `;

```
return `
  <tr>
    <td>${safeText(paper.area) || "—"}</td>
    <td>
      ${
        paper.arxiv
          ? `<a href="${safeText(paper.arxiv)}" target="_blank" rel="noopener noreferrer">${safeText(paper.id)}</a>`
          : safeText(paper.id) || "—"
      }
    </td>
    <td>${titleHtml}</td>
    <td>${renderPaperCell(paper.paper_page)}</td>
    <td>${renderRepoCell(paper.repo)}</td>
    <td>${renderStatusCell(paper.status)}</td>
    <td>${renderEngagementCell(paper.engagement)}</td>
  </tr>
`;
```

}).join("");
}

function sortPapers(papers) {
return [...papers].sort((a, b) => {
const aId = a.id || "";
const bId = b.id || "";
return bId.localeCompare(aId);
});
}

function attachSearch(allPapers) {
const input = document.getElementById("searchInput");

input.addEventListener("input", () => {
const query = input.value.trim().toLowerCase();

```
if (!query) {
  renderRows(sortPapers(allPapers));
  return;
}

const filtered = allPapers.filter((paper) =>
  buildSearchText(paper).includes(query)
);

renderRows(sortPapers(filtered));
```

});
}

async function init() {
const tbody = document.getElementById("papersBody");

try {
const ids = await loadPaperIndex();
const papers = await Promise.all(ids.map(loadPaper));

```
renderRows(sortPapers(papers));
attachSearch(papers);
```

} catch (error) {
console.error(error);
tbody.innerHTML = `       <tr>         <td colspan="7">Failed to load papers.</td>       </tr>
    `;
}
}

init();
