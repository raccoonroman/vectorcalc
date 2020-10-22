import { mobile } from '../const';

if (mobile) {
  const tips = document.querySelectorAll('.delivery-payment__info');

  tips.forEach((tip) => {
    const btn = tip.querySelector('.delivery-payment__info-btn');
    const text = tip.querySelector('.delivery-payment__info-text');

    btn.addEventListener('click', () => {
      tip.classList.toggle('active');
    })
  });
}

