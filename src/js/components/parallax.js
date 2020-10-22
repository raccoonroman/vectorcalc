const speed = {
  '1': 8,
  '2': 4,
  '3': 2,
  '4': 1,
};


const isInViewport = (elem) => {
  const bounding = elem.getBoundingClientRect();
  return bounding.top >= 0 && bounding.top <= window.innerHeight;
};

const setTranslate = (elem, speedValue) => {
  const top = elem.getBoundingClientRect().top;
  elem.style.transform = `translateX(${top / speed[speedValue]}px)`;
};

const elements = document.querySelectorAll('[data-parallax]');

elements.forEach((elem) => {
  const speedValue = +elem.dataset.parallaxSpeed || 1;
  setTranslate(elem, speedValue);
  window.addEventListener('scroll', () => {
    if (isInViewport(elem)) {
      setTranslate(elem, speedValue);
    }
  });
});


// const setRotate = (elem, direction) => {
//   const top = elem.getBoundingClientRect().top;
//   const degrees = 60 * top / window.innerHeight;
//   if (direction === 'left') {
//     elem.style.transform = `rotateY(-${degrees}deg)`;
//   }
//   if (direction === 'right') {
//     elem.style.transform = `rotateY(${degrees}deg)`;
//   }
// };

// const images = document.querySelectorAll('[data-rotate]');

// images.forEach((img) => {
//   const direction = img.dataset.rotate;
//   setRotate(img, direction);
//   window.addEventListener('scroll', () => {
//     if (isInViewport(img)) {
//       setRotate(img, direction);
//     }
//   });
// });

