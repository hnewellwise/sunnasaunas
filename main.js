document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = [...document.querySelectorAll('section')];
  const navbarCollapse = document.querySelector('.navbar-collapse');
  const headerOffset = 70; // adjust this if your nav height changes

  function updateActiveLink() {
    const scrollY = window.scrollY + headerOffset + 30;
    let current = sections[0];
    for (const section of sections) {
      if (scrollY >= section.offsetTop) {
        current = section;
      }
    }

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').substring(1) === current.id) {
        link.classList.add('active');
      }
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const offsetTop = targetEl.offsetTop - headerOffset;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }

      if (navbarCollapse.classList.contains('show')) {
        new bootstrap.Collapse(navbarCollapse).toggle();
      }
    });
  });

  window.addEventListener('scroll', updateActiveLink);
  updateActiveLink();
});

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
