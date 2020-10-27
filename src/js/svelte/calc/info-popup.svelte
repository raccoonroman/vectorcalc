<script>
  export let id;
  export let label;
  export let info;
</script>

<div class="popup popup--hidden" data-popup={id} on:click>
  <div class="popup__box" on:click={e => e.stopPropagation()}>
    <div class="popup-calc">
      <svg class="popup-calc__icon --i1" width="140" height="140">
        <use href="img/sprite.svg#advertising-icon-2"></use>
      </svg>
      <svg class="popup-calc__icon --i2" width="140" height="140">
        <use href="img/sprite.svg#advertising-icon-2"></use>
      </svg>
      <h2 class="popup-calc__title">{label}</h2>
      <p class="popup-calc__text">{info}</p>
      <button class="popup-calc__btn" type="button" on:click>Зрозуміло</button>
    </div>
    <button class="popup__close-btn" type="button" on:click>Close</button>
  </div>
</div>
