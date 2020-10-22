const popups = document.querySelectorAll('[data-popup]');

popups.forEach((popup) => {
  const popupBox = popup.querySelector('[data-popup-box]');
  const openPopupButtons = document.querySelectorAll(`[data-open-popup="${popup.dataset.popup}"]`);
  const closePopupButtons = popup.querySelectorAll('[data-close-popup]');

  const openPopup = (evt) => {
    evt.preventDefault();
    popup.classList.remove('popup--hidden');
  };

  const closePopup = (evt) => {
    popup.classList.add('popup--hidden');
  };

  openPopupButtons.forEach((btn) => {
    btn.addEventListener('click', openPopup);
  });

  closePopupButtons.forEach((btn) => {
    btn.addEventListener('click', closePopup);
  });

  popup.addEventListener('click', closePopup);

  popupBox.addEventListener('click', (evt) => {
    evt.stopPropagation();
  });

  window.addEventListener('keydown', (evt) => {
    if (evt.keyCode === 27) {
      if (!popup.classList.contains('popup--hidden')) {
        closePopup(evt);
      }
    }
  });
});
