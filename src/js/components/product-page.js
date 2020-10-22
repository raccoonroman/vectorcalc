window.addEventListener('load', () => {
  const text = document.querySelector('.product__content-wrapper');
  const moreBtn = document.querySelector('.product__btn-more');

  if (moreBtn && window.getComputedStyle(moreBtn).display !== 'none') {
    const showText = 'Читати більше';
    const hideText = moreBtn.textContent;
    const textHeight = text.offsetHeight;
    const maxHeight = '175px';

    moreBtn.addEventListener('click', () => {
      moreBtn.classList.toggle('active');
      text.classList.toggle('active');
      if (moreBtn.classList.contains('active')) {
        moreBtn.textContent = showText;
        text.style.maxHeight = maxHeight;
      } else {
        moreBtn.textContent = hideText;
        text.style.maxHeight = `${textHeight}px`;
      }
    });

    moreBtn.click();
  }
});
