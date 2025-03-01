// console.log("IT’S ALIVE!");

// function $$(selector, context = document) {
//   return Array.from(context.querySelectorAll(selector));
// }

// let navLinks = $$("nav a");

// let currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname
// );
// currentLink?.classList.add("current");
// console.log(currentLink.classList);

// nav bar
// const basePath =
//   window.location.hostname === "binkybarnes.github.io" ? "dsc106-lab1/" : "";
console.log("mostrecent 3");
const pages = [
  { url: ``, title: "Home" },
  { url: `projects/`, title: "Projects" },
  { url: `resume/`, title: "Resume" },
  { url: `contact/`, title: "Contact" },
  { url: `meta/`, title: "Meta" },
  { url: "https://github.com/binkybarnes/", title: "Github" },
];
const ARE_WE_HOME = document.documentElement.classList.contains("home");
const createNavLink = ({ url, title }) => {
  let a = document.createElement("a");
  a.href = !ARE_WE_HOME && !url.startsWith("http") ? "../" + url : url;
  console.log(!ARE_WE_HOME, !url.startsWith("http"));
  a.textContent = title;
  console.log(a.href);
  const isCurrentPage = a.host === location.host && a.pathname === location.pathname;
  a.classList.toggle("current", isCurrentPage);
  if (a.host !== location.host) a.target = "_blank";

  return a;
};

const nav = document.createElement("nav");
document.body.prepend(nav);
pages.forEach((page) => {
  const link = createNavLink(page);
  nav.append(link);
});

// color scheme switcher

const isDark = matchMedia("(prefers-color-scheme: dark)").matches;
document.body.insertAdjacentHTML(
  "afterbegin",
  `
	<label class="color-scheme">
   Theme:
   <select>
     <option value="light dark">Automatic (${isDark ? "Dark" : "Light"})</option>
     <option value="light">Light</option>
     <option value="dark">Dark</option>
   </select>
 </label>`
);

const select = document.querySelector("label.color-scheme select");
const setColorScheme = (colorScheme) => {
  console.log("color scheme changed to", colorScheme);
  document.documentElement.style.setProperty("color-scheme", colorScheme);
  select.value = colorScheme;
  localStorage.colorScheme = colorScheme;
};
if ("colorScheme" in localStorage) {
  const savedColorSchemeValue = localStorage.colorScheme;
  setColorScheme(savedColorSchemeValue);
}
select.addEventListener("input", function (event) {
  const colorScheme = event.target.value;
  setColorScheme(colorScheme);
});

// contact form space fixer
const contactForm = document.querySelector("form");
contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  // mailto:leaverou@mit.edu?subject=Hello&body=Sup?
  let url = `${contactForm.action}?`;
  for (let [name, value] of data) {
    console.log(name, encodeURIComponent(value));
    url += `${name}=${value}&`;
  }
  location.href = url;
});

// lab 4 ---------------------------------------------------------------
export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    console.log(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching or parsing JSON data:", error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = "h2") {
  // Your code will go here
  if (!(containerElement instanceof HTMLElement)) {
    console.error("Invalid container element provided.");
    return;
  }

  const validHeadings = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);
  if (!validHeadings.has(headingLevel)) {
    console.error(`Invalid heading level "${headingLevel}". Defaulting to "h2".`);
    headingLevel = "h2";
  }

  containerElement.innerHTML = "";
  projects.forEach((project) => {
    const article = document.createElement("article");
    // maybe check project has these attributes
    article.innerHTML = `
        <${headingLevel}>${project.title}</${headingLevel}>
        <img class="project-image" src="${project.image}" alt="${project.title}">
        <p>${project.description}</p>
        <div style="font-family: Baskerville; font-variant-numeric: oldstyle-nums;">c. ${project.year}</div>
    `;

    containerElement.appendChild(article);
  });
}

export async function fetchGitHubData(username) {
  // return statement here
  return fetchJSON(`https://api.github.com/users/${username}`);
}
