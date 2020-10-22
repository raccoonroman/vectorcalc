const tapBar = document.querySelector('.tapbar');
const header = document.querySelector('.header');

if (tapBar && header) {
  const openMenuBtn = tapBar.querySelector('.tapbar__link.open-menu');
  const headerNavWrapper = header.querySelector('.header__nav-wrapper');
  const navList = header.querySelector('.header__nav-list');
  const popupMenuBtn = header.querySelector('[data-open-popup]');

  openMenuBtn.addEventListener('click', () => {
    openMenuBtn.parentElement.classList.toggle('active');
    navList.classList.toggle('active');

    if (navList.classList.contains('active')) {
      navList.style.top = `${headerNavWrapper.offsetHeight}px`;
    } else {
      navList.style.top = '';
    }
  });

  popupMenuBtn.addEventListener('click', () => openMenuBtn.click());
}
