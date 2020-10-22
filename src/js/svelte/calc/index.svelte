<script>
  import { onMount, tick } from 'svelte';
  import Poster from './poster';

  let data = {
    services: [],
    printingSurfaces: [],
  };

  let service = {
    params: [],
    additionals: [],
  };

  onMount(async () => {
		const responce = await fetch('/calc.json');
    data.services = await responce.json();
  });

  onMount(async () => {
		const responce = await fetch('/calc-printing-surface.json');
    data.printingSurfaces = await responce.json();
  });

  const openPopup = (evt) => {
    evt.preventDefault();
    const popupName = evt.currentTarget.dataset.openPopup;
    const popup = document.querySelector(`[data-popup=${popupName}]`);
    popup.classList.remove('popup--hidden');
  };

  const closePopup = (evt) => {
    const popup = evt.target.closest('[data-popup]')
    popup.classList.add('popup--hidden');
  };

  const handleKeydown = (evt) => {
    if (evt.key === 'Escape') {
      const popup = document.querySelector('[data-popup]:not(.popup--hidden)');
      if (popup) {
        popup.classList.add('popup--hidden');
      }
    }
  };

  const onParamsSelectChange = (param) => {
    if (param.id === 'printingSurface') {
      const { params, conditionalParams } = service;
      const filteredConditionalParams = conditionalParams.filter(({ paramFor }) => paramFor === param.value.id);
      const paramPrintingMaterials = params.find(({ id }) => id === 'printingMaterial');
      const printingSurface = data.printingSurfaces.find(({ id }) => id === param.value.id);

      if (printingSurface) {
        paramPrintingMaterials.options = printingSurface.materials;
      } else {
        paramPrintingMaterials.options = [];
      }

      if (param.value.id === 'printingSurfaceBanner') {
        service.params = [...params, ...filteredConditionalParams];
      } else {
        service.params = params.filter(({ paramFor }) => paramFor !== 'printingSurfaceBanner');
      }
    }
  };

  const handleInputLabelOverlaid = (input) => {
    if (input.value) {
      input.classList.add('--filled');
    } else {
      input.classList.remove('--filled');
    }
  };

  const validateSize = (size) => {
    if (size.value >= size.min && size.value <= size.max) {
      size.valid = true;
      service = service;
    } else {
      size.valid = false;
      service = service;
    }
  };

  const onServiceChange = async () => {
    await tick();
    const sizeInputs = document.querySelectorAll('.calc__form-item.half .calc__size-input');
    sizeInputs.forEach((input) => handleInputLabelOverlaid(input));
  };

  const onSizeInput = ({ target }) => {
    const size = service.params.find((param) => param.id === target.id);
    validateSize(size);
  };

  const onSizeBlur = ({ target }) => {
    const size = service.params.find((param) => param.id === target.id);

    if (target.parentNode.classList.contains('half')) {
      handleInputLabelOverlaid(target);
    }

    if (size.value && size.value < size.min) {
      size.value = size.min;
      service = service;
    }
    if (size.value && size.value > size.max) {
      size.value = size.max;
      service = service;
    }

    validateSize(size);
  };

  const onSummaryBtnClick = (evt) => {
    openPopup(evt);
    // const calcFormData = new FormData(document.forms.calc);
    // console.log([...calcFormData.entries()]);
    // console.log([...service.params, ...service.additionals]);
  }

  const getSquare = (params) => {
    const square = params
      .filter(({ id }) => id === 'height' || id === 'width')
      .reduce((acc, param) => acc * param.value, 1) / 10000;

    return Math.round(square * 100) / 100;
  };

  $: allParamsChosenAndValid = service.name
    && service.params.filter(({ type }) => type === 'select').every((param) => param.value.name)
    && service.params.filter(({ type }) => type === 'text').every((param) => param.value.length)
    && service.params
      .filter(({ id }) => id === 'height' || id === 'width' || id === 'lettersHeight'|| id === 'standPockets')
      .every((param) => param.valid);

  // $: square = service.name && service.params
  //   .filter(({ id }) => id === 'height' || id === 'width')
  //   .reduce((acc, size) => acc * size.value, 1) / 10000; // метрів квадратних

  // $: lettersHeight = service.id === 'letters' && service.params.find(({ id }) => id === 'lettersHeight');
  // $: lettersText = service.id === 'letters' && service.params.find(({ id }) => id === 'lettersText');

  // $: lettersHeightPrice = lettersHeight.value * 10 || 0;
  // $: lettersTextLength = lettersText.value ? lettersText.value.length : 0;

  // $: paramsSelectsPrice = service.name && service.params
  //   .filter((param) => param.type === 'select')
  //   .reduce((acc, param) => acc + (param.value.price || 0), 0);

  // $: additionalPrice = service.name && service.additionals
  //   .filter((i) => (i.type === 'checkbox' || i.type === 'toggle') && i.checked)
  //   .reduce((acc, additional) => acc + additional.price, 0);

  // $: totalPrice = service.price * Math.round(square * 100) / 100 + paramsSelectsPrice + additionalPrice + lettersHeightPrice * lettersTextLength;


  let totalPrice = 0;

  $: if (service.id === 'letters') {
    const { params, additionals } = service;

    const lettersHeight = params.find(({ id }) => id === 'lettersHeight');
    const lettersText = params.find(({ id }) => id === 'lettersText');
    const lettersHeightPrice = lettersHeight.value * 10 || 0;
    const lettersTextLength = lettersText.value ? lettersText.value.length : 0;

    const paramsSelectsPrice = params
      .filter((param) => param.type === 'select')
      .reduce((acc, param) => acc + (param.value.price || 0), 0);

    const additionalPrice = additionals
      .filter((i) => (i.type === 'checkbox' || i.type === 'toggle') && i.checked)
      .reduce((acc, additional) => acc + additional.price, 0);

    totalPrice = lettersHeightPrice * lettersTextLength + paramsSelectsPrice + additionalPrice;
  }

  $: if (service.id === 'printing') {
    const { params, additionals } = service;
    const square = getSquare(params);

    const paramsSelectsPrice = params
      .filter((param) => param.type === 'select')
      .reduce((acc, param) => acc + (param.value.price * square || 0), 0);

    const additionalPrice = additionals
      .filter((i) => (i.type === 'checkbox' || i.type === 'toggle') && i.checked)
      .reduce((acc, additional) => acc + additional.price, 0);

    totalPrice = paramsSelectsPrice + additionalPrice;
  }

  $: if (service.id === 'lightbox') {
    const { price, params, additionals } = service;
    const square = getSquare(params);

    const paramsSelectsPrice = params
      .filter((param) => param.type === 'select')
      .reduce((acc, param) => acc + (param.value.price || 0), 0);

    const additionalPrice = additionals
      .filter((i) => (i.type === 'checkbox' || i.type === 'toggle') && i.checked)
      .reduce((acc, additional) => acc + additional.price, 0);

    totalPrice = Math.round(price * square) + paramsSelectsPrice + additionalPrice;
  }

  $: if (service.id === 'numberPlate') {
    const { price, params, additionals } = service;
    const square = getSquare(params);

    const paramsSelectsPrice = params
      .filter((param) => param.type === 'select')
      .reduce((acc, param) => acc + (param.value.price || 0), 0);

    const additionalPrice = additionals
      .filter((i) => (i.type === 'checkbox' || i.type === 'toggle') && i.checked)
      .reduce((acc, additional) => acc + additional.price, 0);

    totalPrice = Math.round(price * square) + paramsSelectsPrice + additionalPrice;
  }

  $: if (service.id === 'stand') {
    const { price, params, additionals } = service;
    const square = getSquare(params);

    const paramsSelectsPrice = params
      .filter((param) => param.type === 'select')
      .reduce((acc, param) => acc + (param.value.price || 0), 0);

    const pocketsNumber = params.find(({ id }) => id === 'standPockets');
    const pocketsPrice = pocketsNumber.value ? pocketsNumber.value * 10 : null;

    const additionalPrice = additionals
      .filter((i) => (i.type === 'checkbox' || i.type === 'toggle') && i.checked)
      .reduce((acc, additional) => acc + additional.price, 0);

    totalPrice = Math.round(price * square) + paramsSelectsPrice + pocketsPrice + additionalPrice;
  }

  $: if (service.id === 'stender') {
    const { price, params, additionals } = service;
    const square = getSquare(params);

    const paramsSelectsPrice = params
      .filter((param) => param.type === 'select')
      .reduce((acc, param) => acc + (param.value.price || 0), 0);

    const additionalPrice = additionals
      .filter((i) => (i.type === 'checkbox' || i.type === 'toggle') && i.checked)
      .reduce((acc, additional) => acc + additional.price, 0);

    totalPrice = Math.round(price * square) + paramsSelectsPrice + additionalPrice;
  }

  $: additionalsWithInfo = service.name && service.additionals.filter(({ info }) => info);
</script>

<svelte:window on:keydown={handleKeydown}/>

<section class="calc">
  <svg class="calc__bg-rect --r1" width="1672" height="1142">
    <use href="img/sprite.svg#rect-1" />
  </svg>
  <svg class="calc__bg-rect --r2" width="1672" height="1142">
    <use href="img/sprite.svg#rect-1" />
  </svg>
  <div class="container calc__container">
    <div class="calc__row">
      <div class="calc__col --left">
        <h1 class="calc__heading">Калькулятор послуг</h1>
        <a class="calc__back" href="index.html">
          <svg width="9" height="16">
            <use href="img/sprite.svg#arrow-right" />
          </svg>
          назад
        </a>
        <form class="calc__form" name="calc">
          <fieldset class="calc__fieldset">
            <legend class="calc__legend">виберіть послугу</legend>
            <ul class="calc__form-items">
              <li class="calc__form-item">
                <select bind:value={service} class="calc__select" id="service" on:input={onServiceChange}>
                  <option value="Вибрати" selected>Вибрати</option>
                  {#each data.services as service (service.id)}
                  <option value={service}>{service.name}</option>
                  {/each}
                </select>
                <label class="calc__form-label" for="service">Послуга</label>
              </li>
            </ul>
            {totalPrice}
          </fieldset>

          {#if service.name}
            <fieldset class="calc__fieldset">
              <legend class="calc__legend">виберіть параметри послуги</legend>
              <ul class="calc__form-items">
                {#each service.params as param (param.id)}
                  <li class="calc__form-item {param.width || ''}">
                    {#if param.type === 'select'}
                      <!-- svelte-ignore a11y-no-onchange -->
                      <select
                        bind:value={param.value}
                        class="calc__select"
                        id={param.id}
                        on:change={() => onParamsSelectChange(param)}
                      >
                        <option value="Вибрати" selected>Вибрати</option>
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
                        class="calc__size-input"
                        type="number"
                        bind:value={param.value}
                        id={param.id}
                        placeholder={param.placeholder}
                        on:blur={onSizeBlur}
                        on:input={onSizeInput}
                      >
                    {/if}
                    <label class="calc__form-label" for={param.id}>{param.label}</label>
                  </li>
                {/each}
              </ul>
            </fieldset>
          {/if}

          {#if allParamsChosenAndValid && service.additionals.length}
            <fieldset class="calc__fieldset">
              <legend class="calc__legend">Додаткові послуги</legend>
              <ul class="calc__form-items --fsz14">

                {#each service.additionals as additional (additional.id)}
                  <li class="calc__form-item">
                    {#if additional.type === 'checkbox'}
                      <input
                        class="calc__form-input-checkbox visually-hidden"
                        type="checkbox"
                        bind:checked={additional.checked}
                        id={additional.id}
                      >
                    {/if}
                    {#if additional.type === 'toggle'}
                      <input
                        class="calc__form-input-toggle visually-hidden"
                        type="checkbox"
                        bind:checked={additional.checked}
                        id={additional.id}
                      >
                    {/if}

                    {#if additional.type === 'select'}
                      <select bind:value={additional.value} class="calc__select" id={additional.id}>
                        <option value="Вибрати" selected>Вибрати</option>
                        {#each additional.options as option}
                          <option value={option}>{option.name}</option>
                        {/each}
                      </select>
                    {/if}

                    <label class="calc__form-label {additional.type}" for={additional.id}>
                      {@html additional.label}
                      <span class="calc__form-{additional.type}"></span>
                    </label>

                    {#if additional.info}
                      <button class="calc__form-info" type="button" data-open-popup={additional.id} on:click={openPopup}>
                        <svg width="22" height="22"><use href="img/sprite.svg#i"></use></svg>
                      </button>
                    {/if}
                  </li>
                {/each}

              </ul>
            </fieldset>
          {/if}

        </form>
      </div>

      <div class="calc__col --right">
        <Poster />
        {#if allParamsChosenAndValid}
          <div class="calc__summary">
            <div class="calc__summary-price">
              <p class="calc__summary-price-label">Орієнтовна вартість</p>
              <p class="calc__summary-price-value">{totalPrice} грн</p>
            </div>
            <button type="button" class="calc__summary-btn" data-open-popup="calc-check" on:click={onSummaryBtnClick}>
              Уточнити вартість
            </button>
          </div>
        {/if}
      </div>

    </div>
  </div>
</section>

{#if additionalsWithInfo}
  {#each additionalsWithInfo as additional (additional.id)}
    <div class="popup popup--hidden" data-popup={additional.id} on:click={closePopup}>
      <div class="popup__box" on:click={evt => evt.stopPropagation()}>
        <div class="popup-calc">
          <svg class="popup-calc__icon --i1" width="140" height="140">
            <use href="img/sprite.svg#advertising-icon-2"></use>
          </svg>
          <svg class="popup-calc__icon --i2" width="140" height="140">
            <use href="img/sprite.svg#advertising-icon-2"></use>
          </svg>
          <h2 class="popup-calc__title">{additional.label}</h2>
          <p class="popup-calc__text">{additional.info}</p>
          <button class="popup-calc__btn" type="button" on:click={closePopup}>Зрозуміло</button>
        </div>
        <button class="popup__close-btn" type="button" on:click={closePopup}>Close</button>
      </div>
    </div>
  {/each}
{/if}

<div class="popup popup--hidden" data-popup="calc-check" on:click={closePopup}>
  <div class="popup__box" on:click={evt => evt.stopPropagation()}>
    <div class="popup-calc">
      <svg class="popup-calc__icon --i1" width="140" height="140">
        <use href="img/sprite.svg#advertising-icon-2"></use>
      </svg>
      <svg class="popup-calc__icon --i2" width="140" height="140">
        <use href="img/sprite.svg#advertising-icon-2"></use>
      </svg>
      <h2 class="popup-calc__title">Уточнення ціни</h2>
      <p class="popup-calc__text">Введіть будь-ласка особисті дані для уточнення ціни замовлення.</p>
      <form class="popup-calc__form" method="post" action="https://echo.htmlacademy.ru" target="_blank">
        <ul class="popup-calc__form-list">
          <li class="popup-calc__form-item">
            <input class="popup-calc__input" type="text" id="username" name="username" placeholder="Ім'я">
            <label class="visually-hidden" for="username">Ім'я</label>
          </li>
          <li class="popup-calc__form-item">
            <input class="popup-calc__input" type="tel" id="usertel" name="usertel" placeholder="Номер телефону">
            <label class="visually-hidden" for="usertel">Номер телефону</label>
          </li>
        </ul>
        <button class="popup-calc__btn" type="submit">Уточнити</button>
      </form>
    </div>
    <button class="popup__close-btn" type="button" on:click={closePopup}>Close</button>
  </div>
</div>
