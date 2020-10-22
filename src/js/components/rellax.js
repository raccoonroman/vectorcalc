import Rellax from 'rellax';
import { mobile } from '../const';

const rellaxElem = document.querySelector('[data-rellax]');

if (rellaxElem) {
  const rellax = new Rellax('[data-rellax]');
  if (mobile) {
    rellax.destroy();
  }
}
