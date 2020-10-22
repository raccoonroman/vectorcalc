const header = document.querySelector('.header');

if (header) {
  const hamburger = header.querySelector('.header__hamburger');
  const headerNavWrapper = header.querySelector('.header__nav-wrapper');
  const navList = header.querySelector('.header__nav-list');
  const popupMenuBtn = header.querySelector('[data-open-popup]');
  // const logo = header.querySelector('.header__logo');
  // const linkBack = header.querySelector('.header__back');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navList.classList.toggle('active');

    if (navList.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
      navList.style.top = `${headerNavWrapper.offsetHeight}px`;
    } else {
      document.body.style.overflow = '';
      navList.style.top = '';
    }
  });

  popupMenuBtn.addEventListener('click', () => hamburger.click());

  // window.addEventListener('scroll', function() {
  //   if (window.scrollY >= 100) {
  //     if (this.oldScroll < this.scrollY) {
  //       header.classList.add('hidden');
  //       // logo.classList.add('centering');
  //       // linkBack.classList.add('visible');
  //     } else {
  //       header.classList.remove('hidden');
  //       // logo.classList.remove('centering');
  //       // linkBack.classList.remove('visible');
  //     }
  //     this.oldScroll = this.scrollY;
  //   }
  // });
}
