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

document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.querySelector('.gallery-scroll');
  const items = Array.from(gallery.querySelectorAll('a'));
  let index = 0;
  let interval;

  function scrollGallery() {
    items.forEach(el => el.classList.remove('focused'));
    items[index].classList.add('focused');
    gallery.scrollTo({
      left: items[index].offsetLeft - gallery.offsetLeft,
      behavior: 'smooth'
    });
    index = (index + 1) % items.length;
  }

  function startAutoScroll() {
    interval = setInterval(scrollGallery, 4000);
  }

  function stopAutoScroll() {
    clearInterval(interval);
  }

  if (items.length > 0) {
    scrollGallery();
    startAutoScroll();

    gallery.addEventListener('mouseenter', stopAutoScroll);
    gallery.addEventListener('mouseleave', startAutoScroll);

    const prevBtn = document.querySelector('.gallery-arrow.left');
const nextBtn = document.querySelector('.gallery-arrow.right');

if (prevBtn && nextBtn) {
  prevBtn.addEventListener('click', () => {
    index = (index - 1 + items.length) % items.length;
    scrollGallery();
  });
  nextBtn.addEventListener('click', () => {
    index = (index + 1) % items.length;
    scrollGallery();
  });
}

  }

  const modal = new bootstrap.Modal(document.getElementById('imageModal'));
const modalImage = document.getElementById('modalImage');

document.querySelectorAll('.gallery-img').forEach(img => {
  img.addEventListener('click', () => {
    modalImage.src = img.src;
    modal.show();
  });
});

});
