import AOS from 'aos';
import 'aos/dist/aos.css';

AOS.init({
  disable: window.innerWidth < 1024,
});

const tabs = document.querySelectorAll('.information__tab[data-tab]');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => AOS.refresh());
});
