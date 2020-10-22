import { mobile } from '../const';

const serviceLinks = document.querySelectorAll('.main-nav .service__link');

serviceLinks.forEach((link) => {
  if (mobile) {
    link.addEventListener('click', (evt) => {
      evt.preventDefault();

      setTimeout(() => {
        window.location = link.href;
      }, 500);
    });
  }
})
