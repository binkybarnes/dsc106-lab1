let data = [];
let commits = [];

function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      // Each 'lines' array contains all lines modified in this commit
      // All lines in a commit have the same author, date, etc.
      // So we can get this information from the first line
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      // What information should we return about this commit?
      let ret = {
        id: commit,
        url: "https://github.com/binkybarnes/dsc106-lab1/commit/" + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        // What other properties might be useful?
        // Calculate hour as a decimal for time analysis
        // e.g., 2:30 PM = 14.5
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        // How many lines were modified?
        totalLines: lines.length,
      };

      Object.defineProperty(ret, "lines", {
        value: lines,
        // What other options do we need to set?
        // Hint: look up configurable, writable, and enumerable
        writable: true,
        configurable: true,
        enumerable: false,
      });
      return ret;
    });
}

function displayStats() {
  // Process commits first
  processCommits();

  // Create the dl element
  const dl = d3.select("#stats").append("dl").attr("class", "stats");

  // Add total LOC
  dl.append("dt").html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append("dd").text(data.length);

  // Add total commits
  dl.append("dt").text("Total commits");
  dl.append("dd").text(commits.length);

  dl.append("dt").text("Longest line length");
  dl.append("dd").text(data.reduce((max, line) => Math.max(max, line.length), -Infinity));

  dl.append("dt").text("Average file length (in lines)");
  //   dl.append("dd").text(data.reduce((sum, line) => sum + line.));
  const fileSizes = d3.rollups(
    data,
    (v) => v.length,
    (d) => d.file
  );
  let avgFileLengthLine = d3.mean(fileSizes, (d) => d[1]);
  dl.append("dd").text(avgFileLengthLine);

  dl.append("dt").text("Average file length (in characters)");
  let fileSizesChars = d3.rollups(
    data,
    (v) => d3.sum(v, (v) => v.length),
    (d) => d.file
  );
  let avgFileLengthChar = d3.mean(fileSizesChars, (d) => d[1]);

  //   let groupedFiles = d3.groups(data, (d) => d.file);
  //   let files = groupedFiles.map((group) => group[1]);
  //   let fileChars = files.map((file) => d3.sum(file, (line) => line.length));
  //   let avgFileLengthChar = d3.mean(fileChars);
  dl.append("dd").text(avgFileLengthChar);

  // Add more stats as needed...
}

async function loadData() {
  data = await d3.csv("loc.csv", (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + "T00:00" + row.timezone),
    datetime: new Date(row.datetime),
  }));
  //   processCommits();
  displayStats();
}

function updateTooltipContent(commit) {
  const link = document.getElementById("commit-link");
  const date = document.getElementById("commit-date");
  const time = document.getElementById("commit-time");
  const author = document.getElementById("commit-author");
  const linesEdited = document.getElementById("commit-lines");

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString("en", {
    dateStyle: "full",
  });
  time.textContent = commit.time;
  author.textContent = commit.author;
  linesEdited.textContent = commit.totalLines;
}

let xScale;
let yScale;
function createScatterplot() {
  const width = 1000;
  const height = 600;

  const svg = d3.select("#chart").append("svg").attr("viewBox", `0 0 ${width} ${height}`).style("overflow", "visible");
  xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

  yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  const dots = svg.append("g").attr("class", "dots");
  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3
    .scaleSqrt() // Change only this line
    .domain([minLines, maxLines])
    .range([2, 30]);

  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  // Use sortedCommits in your selection instead of commits

  dots
    .selectAll("circle")
    .data(sortedCommits)
    .join("circle")
    .attr("cx", (d) => xScale(d.datetime))
    .attr("cy", (d) => yScale(d.hourFrac))
    .attr("r", (d) => rScale(d.totalLines))
    .attr("fill", "steelblue")
    .attr("opacity", 0.5)
    .on("mouseenter", (event, commit) => {
      updateTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
      d3.select(event.target).attr("opacity", 1);
    })
    .on("mouseleave", () => {
      updateTooltipContent({});
      updateTooltipVisibility(false);
      d3.select(event.target).attr("opacity", 0.5);
    });

  const margin = { top: 10, right: 10, bottom: 30, left: 20 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // Update scales with new ranges
  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);

  // Add gridlines BEFORE the axes
  const gridlines = svg.append("g").attr("class", "gridlines").attr("transform", `translate(${usableArea.left}, 0)`);

  // Create gridlines as an axis with no labels and full-width ticks
  gridlines.call(d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width));

  // Create the axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, "0") + ":00");

  // Add X axis
  svg.append("g").attr("transform", `translate(0, ${usableArea.bottom})`).call(xAxis);

  // Add Y axis
  svg.append("g").attr("transform", `translate(${usableArea.left}, 0)`).call(yAxis);

  brushSelector();
  // Update brush initialization to listen for events
}

const tooltip = document.getElementById("commit-tooltip");
tooltip.hidden = true;

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById("commit-tooltip");
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById("commit-tooltip");
  tooltip.style.left = `${event.clientX + 60}px`;
  tooltip.style.top = `${event.clientY - 50}px`;
}

function brushSelector() {
  const svg = document.querySelector("svg");
  // Create brush
  d3.select(svg).call(d3.brush());
  // Raise dots and everything after overlay
  d3.select(svg).selectAll(".dots, .overlay ~ *").raise();
  // Update brush initialization to listen for events
  d3.select(svg).call(d3.brush().on("start brush end", brushed));
}
let brushSelection = null;

function updateSelectionCount() {
  const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];

  const countElement = document.getElementById("selection-count");
  countElement.textContent = `${selectedCommits.length || "No"} commits selected`;

  return selectedCommits;
}

function updateLanguageBreakdown() {
  const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
  const container = document.getElementById("language-breakdown");

  if (selectedCommits.length === 0) {
    container.innerHTML = "";
    return;
  }
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  // Update DOM with breakdown
  container.innerHTML = "";

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format(".1~%")(proportion);

    container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
  }

  return breakdown;
}

function brushed(event) {
  brushSelection = event.selection;
  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}

function isCommitSelected(commit) {
  if (!brushSelection) {
    return false;
  }
  // TODO: return true if commit is within brushSelection
  // and false if not

  // Get the x and y position of the commit
  const commitX = xScale(commit.datetime); // Assuming `datetime` is your time-based field
  const commitY = yScale(commit.hourFrac); // Assuming `hourFrac` is your y-axis value

  // Get the brush selection bounds
  const [[x0, y0], [x1, y1]] = brushSelection;

  // Check if the commit's position is inside the brush selection
  return commitX >= x0 && commitX <= x1 && commitY >= y0 && commitY <= y1;
}

function updateSelection() {
  // Update visual state of dots based on selection
  d3.selectAll("circle").classed("selected", (d) => isCommitSelected(d));
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  createScatterplot();
  //   console.log(data[0]);
  //   console.log(commits[0]);
});
