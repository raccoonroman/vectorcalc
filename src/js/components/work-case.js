import { mobile } from '../const';

if (mobile) {
  const workCaseCards = document.querySelectorAll('.work-case');

  workCaseCards.forEach((card) => {
    card.addEventListener('click', (evt) => {
      evt.preventDefault();
      workCaseCards.forEach((i) => i.classList.remove('active'));
      card.classList.add('active');
    })
  });
}

