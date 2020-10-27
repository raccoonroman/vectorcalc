<script>
  import { slide } from 'svelte/transition';
  export let totalPrice;
</script>

<div class="calc__summary" transition:slide>
  <div class="calc__summary-price">
    <p class="calc__summary-price-label">Орієнтовна вартість</p>
    <p class="calc__summary-price-value">{totalPrice} грн</p>
  </div>
  <button type="button" class="calc__summary-btn" data-open-popup="calc-check" on:click>
    Уточнити вартість
  </button>
</div>
