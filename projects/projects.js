import { fetchJSON, renderProjects } from "../global.js";

const projects = await fetchJSON("../lib/projects.json");
const projectsContainer = document.querySelector(".projects");
console.log(projects);

renderProjects(projects, projectsContainer, "h2");

const projectsTitle = document.querySelector(".projects-title");
projectsTitle.textContent = `${projects.length} Projects`;

// ------lab 5 --------
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// let arc = arcGenerator({
//   startAngle: 0,
//   endAngle: 2 * Math.PI,
// });
// d3.select("svg").append("path").attr("d", arc).attr("fill", "red");

// let data = [
//   { value: 1, label: "apples" },
//   { value: 2, label: "oranges" },
//   { value: 3, label: "mangos" },
//   { value: 4, label: "pears" },
//   { value: 5, label: "limes" },
//   { value: 5, label: "cherries" },
// ];
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let rolledData = d3.rollups(
  projects,
  (v) => v.length,
  (d) => d.year
);

let data = rolledData.map(([year, count]) => {
  return { value: count, label: year };
});

// let colors = d3.scaleOrdinal(d3.schemeSet3);

let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));

// arcs.forEach((arc, idx) => {
//   d3.select("svg").append("path").attr("d", arc).attr("fill", colors(idx));
// });

// //  ---- LEGEND for pie chart ------
let colors = d3.scaleOrdinal(d3.schemeSet3);
let legend = d3.select(".legend");
data.forEach((d, idx) => {
  legend
    .append("li")
    .attr("style", `--color:${colors(idx)}`) // set the style attribute while passing in parameters
    .attr("class", "legend-item")
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
});

let selectedIndex = -1;
let svg = d3.select("svg");
// Refactor all plotting into one function
function renderPieChart(projectsGiven, keepSelected = false) {
  let newArcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  // re-calculate rolled data
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );
  // re-calculate data
  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });
  // re-calculate slice generator, arc data, arc, etc.
  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => newArcGenerator(d));
  // TODO: clear up paths and legends
  d3.select("svg").selectAll("*").remove();
  d3.select(".legend").selectAll("*").remove();

  // Update paths and legends
  let newLegend = d3.select(".legend");
  newArcs.forEach((arc, idx) => {
    d3.select("svg")
      .append("path")
      .attr("d", arc)
      .attr("fill", colors(idx))
      .on("click", () => {
        // SUSSY LINE BUG?
        // when click pie, then type, the clicked state goes away
        selectedIndex = selectedIndex === idx ? -1 : idx;

        svg.selectAll("path").attr("class", (_, i) => (i === selectedIndex ? "selected" : ""));

        newLegend
          .selectAll("li")
          .attr("class", (_, i) => (i === selectedIndex ? "selected legend-item" : "legend-item"));

        if (selectedIndex === -1) {
          renderProjects(projects, projectsContainer, "h2");
        } else {
          let selectedYear = newData[selectedIndex].label;
          let filteredProjects = projects.filter((project) => {
            let matchesSearch = Object.values(project).join("\n").toLowerCase().includes(query);
            let matchesYear = project.year === selectedYear;
            return matchesSearch && matchesYear;
          });
          renderProjects(filteredProjects, projectsContainer, "h2");
        }
      });
  });
  // update paths and legends, refer to steps 1.4 and 2.2
  //  ---- LEGEND for pie chart ------
  //   let newLegend = d3.select(".legend");
  //   newArcs.forEach((arc, idx) => {
  //     d3.select("svg").append("path").attr("d", arc).attr("fill", colors(idx));
  //   });

  newData.forEach((d, idx) => {
    newLegend
      .append("li")
      .attr("style", `--color:${colors(idx)}`) // set the style attribute while passing in parameters
      .attr("class", "legend-item")
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
  });
  //   data = newData;
  //   arcs = newArcs;
}
renderPieChart(projects);

// -------- SEARCH PROJECTS ------

let query = "";
let searchInput = document.querySelector(".searchBar");

searchInput.addEventListener("input", (event) => {
  // update query value
  query = event.target.value.toLowerCase();
  // TODO: filter the projects
  let filteredProjects = projects.filter((project) => Object.values(project).join("\n").toLowerCase().includes(query));

  if (selectedIndex !== -1) {
    console.log(data);
    let selectedYear = data[selectedIndex].label;
    filteredProjects = projects.filter((project) => project.year === selectedYear);
  }
  //   let filteredProjects = projects.filter((project) => {
  //     let values = Object.values(project).join("\n").toLowerCase();
  //     return values.includes(query);
  //   });
  // TODO: render updated projects!

  renderPieChart(filteredProjects, true);
  renderProjects(filteredProjects, projectsContainer, "h2");
});

// ------ CLICKING THE CHART ------

// let svg = d3.select("svg");
// svg.selectAll("path").remove();
// arcs.forEach((arc, i) => {
//   svg
//     .append("path")
//     .attr("d", arc)
//     .attr("fill", colors(i))
//     .on("click", () => {
//       console.log("bruh");
//       // What should we do? (Keep scrolling to find out!)
//       selectedIndex = selectedIndex === i ? -1 : i;

//       svg.selectAll("path").attr("class", (_, idx) =>
//         // TODO: filter idx to find correct pie slice and apply CSS from above
//         idx === selectedIndex ? "selected" : ""
//       );
//       legend.selectAll("li").attr("class", (_, idx) =>
//         // TODO: filter idx to find correct legend and apply CSS from above
//         idx === selectedIndex ? "selected legend-item" : "legend-item"
//       );
//     });
// });
