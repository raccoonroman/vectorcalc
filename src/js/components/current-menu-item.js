const header = document.querySelector('.header');

if (header) {
  const navItems = header.querySelectorAll('.header__nav-item a');

  navItems.forEach((link) => {
    if (window.location.href === link.href) {
      link.parentElement.classList.add('active');
    }
  });
}

const tapbar = document.querySelector('.tapbar');

if (tapbar) {
  const tapbarItems = tapbar.querySelectorAll('.tapbar__link');

  tapbarItems.forEach((link) => {
    if (window.location.href === link.href) {
      link.parentElement.classList.add('active');
    }
  });
}
