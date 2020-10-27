<script>
  import { onMount, tick } from 'svelte';
  import ParamItem from './param-item';
  import Poster from './poster';
  import SummaryPrice from './sumarry-price';
  import InfoPopup from './info-popup';

  let services = [];
  let service = {};
  let totalPrice = 0;
  let section;

  const fontGeneric = {
    'Roboto': 'sans-serif',
    'Montserrat': 'sans-serif',
    'Merriweather': 'serif',
    'Oswald': 'sans-serif',
    'Roboto Mono': 'monospace',
  };

  onMount(async () => {
    const responce = await fetch('calc.json');
    services = await responce.json();
  });

  const openPopup = (evt) => {
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

  const validateNumber = (param) => {
    if (param.value >= param.min && param.value <= param.max) {
      param.valid = true;
      service = service;
    } else {
      param.valid = false;
      service = service;
    }
  };

  const setInputFontFamily = async (param) => {
    await tick();
    const textInput = section.querySelector('#lettersText');
    const fontFamily = param.value.name || 'Roboto';
    textInput.style.fontFamily = `${fontFamily}, ${fontGeneric[fontFamily]}`;
  };

  // form event listeners
  const onServiceChange = () => {
    if (service.id === 'letters') {
      const fontFamilyParam = service.params.find(({ id }) => id === 'lettersFontFamily');
      setInputFontFamily(fontFamilyParam);
    }
  };

  const onServiceTypeChange = () => {
    if (service.type instanceof Object) {
      service.price = service.type.price;
      service.params = service.type.params;
      service.additionals = service.type.additionals;
    } else {
      service.price = null;
      service.params = null;
      service.additionals = null;
    }
  };

  const getParamByElem = (elem) => service.params.find(({ id }) => id === elem.id);

  const onNumberFieldInput = ({ target }) => {
    const param = getParamByElem(target);
    validateNumber(param);

    if (param.id === 'standPockets') {
      param.subparams = param.value && param.conditionalParams;
    }
  };

  const onNumberFieldBlur = ({ target }) => {
    const param = getParamByElem(target);

    if (param.value && param.value < param.min) {
      param.value = param.min;
    }
    if (param.value && param.value > param.max) {
      param.value = param.max;
    }

    validateNumber(param);
  };

  const onParamSelectChange = ({ target }) => {
    const param = getParamByElem(target);

    if (param.id === 'lettersFontFamily') {
      setInputFontFamily(param);
    }

    if (param.id === 'paperMaterial') {
      const qualityParam = service.params.find(({ id }) => id === 'paperQuality');

      if (param.value.name === 'Blue-back') {
        qualityParam.options = [...qualityParam.conditionalOptions, ...qualityParam.options];
      } else {
        qualityParam.options = qualityParam.options.filter(({ name }) => (
          !qualityParam.conditionalOptions.some((option) => option.name === name)
        ));
      }
    }

    if (param.id === 'numberPlateMaterial') {
      param.subparams = param.conditionalParams.filter(({ forParam }) => forParam === param.value.name);
    }
  };

  const onToggleChange = (param) => {
    const allParams = [...service.params, ...service.additionals];

    if (param.id === 'urgentProd24' && param.checked) {
      const urgentProd4 = allParams.find(({ id }) => id === 'urgentProd4');
      if (urgentProd4) {
        urgentProd4.checked = false;
        service = service;
      }
    }

    if (param.id === 'urgentProd4' && param.checked) {
      const urgentProd24 = allParams.find(({ id }) => id === 'urgentProd24');
      if (urgentProd24) {
        urgentProd24.checked = false;
        service = service;
      }
    }
  };
  // end form event listeners

  const onSummaryBtnClick = (evt) => {
    openPopup(evt);
  };

  const roundPrice = (price) => Math.round(price * 100) / 100;

  const getSquare = (params) => params
    .filter(({ id }) => id === 'height' || id === 'width')
    .reduce((acc, param) => acc * param.value, 1) / 10000;


  $: allParamsChosenAndValid = service.params
    && service.params.filter(({ type }) => type === 'select').every(({ value }) => value.name)
    && service.params.filter(({ type }) => type === 'text').every(({ value }) => value.length)
    && service.params.filter(({ id }) => id === 'height' || id === 'width').every(({ valid }) => valid);


  $: if (service.id === 'letters') {
    const { params, additionals } = service;

    const lettersHeight = params.find(({ id }) => id === 'height');
    const lettersText = params.find(({ id }) => id === 'lettersText');
    const lettersHeightPrice = lettersHeight.value * 10 || 0;
    const lettersTextLength = lettersText.value ? lettersText.value.length : 0;

    const paramsSelectsPrice = params
      .filter((param) => param.type === 'select')
      .reduce((acc, param) => acc + (param.value.price || 0), 0);

    const additionalPrice = additionals
      .filter((i) => (i.type === 'checkbox' || i.type === 'toggle') && i.checked)
      .reduce((acc, additional) => acc + additional.price, 0);

    totalPrice = roundPrice(lettersHeightPrice * lettersTextLength + paramsSelectsPrice + additionalPrice);
  }


  $: if (service.id === 'printing' && service.type instanceof Object) {
    const { price = 0, params = [], additionals = [] } = service;
    const square = getSquare(params);

    const paramsSelectsPrice = params
      .filter((param) => param.type === 'select')
      .reduce((acc, param) => acc + (param.value.price * square || 0), 0);

    const additionalPrice = additionals
      .filter((i) => (i.type === 'checkbox' || i.type === 'toggle') && i.checked)
      .reduce((acc, additional) => acc + additional.price, 0);

    totalPrice = roundPrice(price * square + paramsSelectsPrice + additionalPrice);
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

    totalPrice = roundPrice(price * square + paramsSelectsPrice + additionalPrice);
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

    totalPrice = roundPrice(price * square + paramsSelectsPrice + additionalPrice);
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

    totalPrice = roundPrice(price * square + paramsSelectsPrice + pocketsPrice + additionalPrice);
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

    totalPrice = roundPrice(price * square + paramsSelectsPrice + additionalPrice);
  }

  $: additionalsWithInfo = service.additionals && service.additionals.filter(({ info }) => info);
</script>

<svelte:window on:keydown={handleKeydown}/>

<section class="calc" bind:this={section}>
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
                <!-- svelte-ignore a11y-no-onchange -->
                <select bind:value={service} class="calc__select" id="service" on:change={onServiceChange}>
                  <option>Вибрати</option>
                  {#each services as service (service.id)}
                    <option value={service}>{service.name}</option>
                  {/each}
                </select>
                <label class="calc__form-label" for="service">Послуга</label>
              </li>
              {#if service.types}
                <li class="calc__form-item">
                  <!-- svelte-ignore a11y-no-onchange -->
                  <select bind:value={service.type} class="calc__select" id="service-type" on:change={onServiceTypeChange}>
                    <option>Вибрати</option>
                    {#each service.types as serviceType (serviceType.id)}
                      <option value={serviceType}>{serviceType.name}</option>
                    {/each}
                  </select>
                  <label class="calc__form-label" for="service-type">{service.typesLabel}</label>
                </li>
              {/if}
            </ul>
          </fieldset>

          {#if service.params}
            <fieldset class="calc__fieldset">
              <legend class="calc__legend">виберіть параметри послуги</legend>
              <ul class="calc__form-items">
                {#each service.params as param (param.id)}
                  <ParamItem
                    bind:param={param}
                    onSelectChange={onParamSelectChange}
                    onNumberFieldBlur={onNumberFieldBlur}
                    onNumberFieldInput={onNumberFieldInput}
                  />
                  {#if param.subparams}
                    {#each param.subparams as subparam (subparam.id)}
                      <ParamItem bind:param={subparam} />
                    {/each}
                  {/if}
                {/each}
              </ul>
            </fieldset>
          {/if}

          {#if allParamsChosenAndValid && service.additionals.length}
            <fieldset class="calc__fieldset">
              <legend class="calc__legend">Додаткові послуги</legend>
              <ul class="calc__form-items --fsz14">
                {#each service.additionals as additional (additional.id)}
                  <ParamItem
                    bind:param={additional}
                    onToggleChange={onToggleChange}
                    openPopup={openPopup}
                  />
                {/each}
              </ul>
            </fieldset>
          {/if}

        </form>
      </div>

      <div class="calc__col --right">
        <Poster />
        {#if allParamsChosenAndValid}
          <SummaryPrice totalPrice={totalPrice} on:click={onSummaryBtnClick} />
        {/if}
      </div>

    </div>
  </div>
</section>

{#if additionalsWithInfo}
  {#each additionalsWithInfo as additional (additional.id)}
    <InfoPopup {...additional} on:click={closePopup} />
  {/each}
{/if}

<div class="popup popup--hidden" data-popup="calc-check" on:click={closePopup}>
  <div class="popup__box" on:click|stopPropagation>
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
