<script>
  export let param;
  export let onSelectChange;
  export let onNumberFieldBlur;
  export let onNumberFieldInput;
  export let onToggleChange;
  export let openPopup;

  const { id, type, placeholder } = param;
</script>

<li class="calc__form-item {param.width || ''}">
  {#if type === 'select'}
    <!-- svelte-ignore a11y-no-onchange -->
    <select bind:value={param.value} class="calc__select" {id} on:change={onSelectChange}>
      <option>Вибрати</option>
      {#each param.options as option}
        <option value={option}>{option.name}</option>
      {/each}
    </select>
  {/if}
  {#if type === 'text'}
    <input
      class="calc__text-input"
      type="text"
      bind:value={param.value}
      {id}
      {placeholder}
    >
  {/if}
  {#if type === 'number'}
    <input
      class="calc__size-input {param.value ? '--filled' : ''}"
      type="number"
      bind:value={param.value}
      {id}
      {placeholder}
      min={param.min}
      max={param.max}
      on:blur={onNumberFieldBlur}
      on:input={onNumberFieldInput}
    >
  {/if}
  {#if type === 'checkbox'}
    <input
      class="calc__form-input-checkbox visually-hidden"
      type="checkbox"
      bind:checked={param.checked}
      {id}
    >
  {/if}
  {#if type === 'toggle'}
    <input
      class="calc__form-input-toggle visually-hidden"
      type="checkbox"
      bind:checked={param.checked}
      {id}
      on:change={() => onToggleChange(param)}
    >
  {/if}

  <label class="calc__form-label {type}" for={id}>
    {@html param.label}
    {#if type === 'checkbox' || type === 'toggle'}
      <span class="calc__form-{type}"></span>
    {/if}
  </label>

  {#if param.info}
    <button class="calc__form-info" type="button" data-open-popup={id} on:click={openPopup}>
      <svg width="22" height="22"><use href="img/sprite.svg#i"></use></svg>
    </button>
  {/if}
</li>
