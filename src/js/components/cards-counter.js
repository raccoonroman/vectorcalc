const section = document.querySelector('.cards-grid');

if (section) {
  const cardLinks = section.querySelectorAll('.card__link');
  cardLinks.forEach((link, i) => {
    const index = i + 1;
    const value = index < 10 ? `0${index}` : index;
    link.insertAdjacentHTML('afterbegin', `<span class="card__counter">${value}</span>`)
  });
}
