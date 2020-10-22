import Swiper from 'swiper/bundle';
import 'swiper/swiper-bundle.css';
import { mobile } from '../const';

new Swiper('.information__slider-container', {
  spaceBetween: 2,
  navigation: {
    nextEl: '.information__slider-nav .swiper-button-next',
    prevEl: '.information__slider-nav .swiper-button-prev',
  },
  scrollbar: {
    el: '.information__slider-nav .swiper-scrollbar',
  },
  breakpoints: {
    320: {
      slidesPerView: 1,
      autoHeight: true,
      spaceBetween: 15,
    },
    768: {
      slidesPerView: 1.2,
      autoHeight: false,
      spaceBetween: 2,
    },
    1023: {
      slidesPerView: 2,
    },
  }
});

new Swiper('.photo-gallery__container', {
  spaceBetween: 30,
  pagination: {
    el: '.photo-gallery .swiper-pagination',
    type: 'fraction',
  },
  navigation: {
    nextEl: '.photo-gallery__arrow.next',
    prevEl: '.photo-gallery__arrow.prev',
  },
});

if (mobile) {
  new Swiper('.cards-grid__wrapper', {
    spaceBetween: 2,
    pagination: {
      el: '.cards-grid__slider-nav .swiper-pagination',
      type: 'fraction',
    },
    navigation: {
      nextEl: '.cards-grid__slider-arrow.next',
      prevEl: '.cards-grid__slider-arrow.prev',
    },
    breakpoints: {
      320: {
        slidesPerView: 1.2,
      },
      375: {
        slidesPerView: 1.4,
      },
      480: {
        slidesPerView: 1.6,
      },
    }
  });
}
