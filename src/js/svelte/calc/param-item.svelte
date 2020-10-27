<script>
  export let param;
  export let onSelectChange;
  export let onNumberFieldBlur;
  export let onNumberFieldInput;
  export let onToggleChange;
  export let openPopup;
</script>

<li class="calc__form-item {param.width || ''}">
  {#if param.type === 'select'}
    <!-- svelte-ignore a11y-no-onchange -->
    <select bind:value={param.value} class="calc__select" id={param.id} on:change={onSelectChange}>
      <option>Вибрати</option>
      {#each param.options as option}
        <option value={option}>{option.name}</option>
      {/each}
    </select>
  {/if}
  {#if param.type === 'text'}
    <input
      class="calc__text-input"
      type="text"
      bind:value={param.value}
      id={param.id}
      placeholder={param.placeholder}
    >
  {/if}
  {#if param.type === 'number'}
    <input
      class="calc__size-input {param.value ? '--filled' : ''}"
      type="number"
      bind:value={param.value}
      id={param.id}
      placeholder={param.placeholder}
      on:blur={onNumberFieldBlur}
      on:input={onNumberFieldInput}
    >
  {/if}
  {#if param.type === 'checkbox'}
    <input
      class="calc__form-input-checkbox visually-hidden"
      type="checkbox"
      bind:checked={param.checked}
      id={param.id}
    >
  {/if}
  {#if param.type === 'toggle'}
    <input
      class="calc__form-input-toggle visually-hidden"
      type="checkbox"
      bind:checked={param.checked}
      id={param.id}
      on:change={() => onToggleChange(param)}
    >
  {/if}

  <label class="calc__form-label {param.type}" for={param.id}>
    {@html param.label}
    {#if param.type === 'checkbox' || param.type === 'toggle'}
      <span class="calc__form-{param.type}"></span>
    {/if}
  </label>

  {#if param.info}
    <button class="calc__form-info" type="button" data-open-popup={param.id} on:click={openPopup}>
      <svg width="22" height="22"><use href="img/sprite.svg#i"></use></svg>
    </button>
  {/if}
</li>
