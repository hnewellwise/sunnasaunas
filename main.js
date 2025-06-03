// Back to Top Button Functionality
const backToTopBtn = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  const scrollDepth = window.scrollY;
  const halfPage = document.body.scrollHeight / 2;

  if (scrollDepth > halfPage) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Navigation Highlighting
document.addEventListener("DOMContentLoaded", function () {
  const path = window.location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === path || (href === "index.html" && path === "")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
});
