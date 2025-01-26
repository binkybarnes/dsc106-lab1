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
const basePath =
  window.location.hostname === "binkybarnes.github.io" ? "dsc106-lab1/" : "";

const pages = [
  { url: `${basePath}`, title: "Home" },
  { url: `${basePath}projects/`, title: "Projects" },
  { url: `${basePath}resume/`, title: "Resume" },
  { url: `${basePath}contact/`, title: "Contact" },
  { url: "https://github.com/binkybarnes/", title: "Github" },
];
const ARE_WE_HOME = document.documentElement.classList.contains("home");

const createNavLink = ({ url, title }) => {
  let a = document.createElement("a");
  a.href = !ARE_WE_HOME && !url.startsWith("http") ? "../" + url : url;
  a.textContent = title;
  const isCurrentPage =
    a.host === location.host && a.pathname === location.pathname;
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
     <option value="light dark">Automatic (${
       isDark ? "Dark" : "Light"
     })</option>
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
