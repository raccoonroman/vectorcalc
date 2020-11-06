<script>
  import { onMount, tick } from 'svelte';
  import { fontGeneric, paperFormats } from './const';
  import ParamItem from './param-item';
  import Poster from './poster';
  import SummaryPrice from './sumarry-price';
  import InfoPopup from './info-popup';

  let services = [];
  let service = {};
  let totalPrice = 0;
  let section;
  let allParamsChosenAndValid = false;

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

  const getParamByElementId = (id) => service.params.find((param) => id === param.id);

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

  const getParamSquare = () => {
    const width = getParamByElementId('width');
    const height = getParamByElementId('height');
    return width.value * height.value  / 1000000;
  };

  const getParamPerimeter = () => {
    const width = getParamByElementId('width');
    const height = getParamByElementId('height');
    return (width.value + height.value) * 2 / 1000;
  };


  const addConditionalOptionsToParamOptions = (param, position = 'afterend') => {
    const { options, conditionalOptions } = param;
    const hasParamConditionalOptions = options.some((option) => (
      conditionalOptions.some(({ name }) => name === option.name)
    ));

    let newOptions;
    switch (position) {
      case 'afterend':
        newOptions = [...options, ...conditionalOptions];
        break;
      case 'beforeend':
        newOptions = [...conditionalOptions, ...options];
        break;
      default:
        newOptions = options;
    }
    param.options = !hasParamConditionalOptions ? newOptions : options;
  };

  const removeConditionalOptionsFromParamOptins = (param) => {
    const { options, conditionalOptions } = param;
    param.options = options.filter(({ name }) => (
      !conditionalOptions.some((option) => option.name === name)
    ));
    const isParamValueFromConditionals = conditionalOptions.some((option) => option === param.value)
    param.value = isParamValueFromConditionals ? param.options[param.options.length - 1] : param.value;
  };

  // form event listeners
  const onServiceChange = () => {
    if (service.id === 'letters') { // відновити шрифт, коли міняється тип самої послуги
      const fontFamilyParam = getParamByElementId('lettersFontFamily');
      setInputFontFamily(fontFamilyParam);
    }
    if (service.id === 'stand') {
      const materialParam = getParamByElementId('standMaterial');
      addConditionalOptionsToParamOptions(materialParam);
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

  const onNumberFieldInput = ({ target }) => {
    const param = getParamByElementId(target.id);
    validateNumber(param);

    if (param.id === 'standPockets') { // коли встановили кількість кишень - відобразити додаткові поля
      param.subparams = param.value > 0 && param.conditionalParams;
    }
  };

  const limitMaxValueForSide = (widthParam, heightParam, currentParam) => {
    if (currentParam.id === 'width') {
      const { limited, regular } = heightParam.conditionalMax;
      heightParam.max = currentParam.value > currentParam.conditionalMax.limited ? limited : regular;
    } else if (currentParam.id === 'height') {
      const { limited, regular } = widthParam.conditionalMax;
      widthParam.max = currentParam.value > currentParam.conditionalMax.limited ? limited : regular;
    }
  };

  const onNumberFieldBlur = ({ target }) => {
    const param = getParamByElementId(target.id);
    const widthParam = getParamByElementId('width');
    const heightParam = getParamByElementId('height');

    if (param.value && param.value < param.min) {
      param.value = param.min;
    }
    if (param.value && param.value > param.max) {
      param.value = param.max;
    }

    switch (service.id) {
      case 'stand': {
        const pocketsCountParam = getParamByElementId('standPockets');
        const materialParam = getParamByElementId('standMaterial');

        limitMaxValueForSide(widthParam, heightParam, param);

        if (param.id === 'width' || param.id === 'height') { // коли змінилася площа стенду - перерахувати кількість кишень
          if (pocketsCountParam.subparams) {
            const pocketsSizeParam = pocketsCountParam.subparams.find(({ id }) => id === 'standPocketsSize');
            setPocketsCountValue(pocketsCountParam, pocketsSizeParam);
          }
        }

        if (widthParam.value > 1500 || heightParam.value > 1500) {
          removeConditionalOptionsFromParamOptins(materialParam);
        } else {
          addConditionalOptionsToParamOptions(materialParam);
        }
        break;
      }
      case 'printing': {
        if (service.type.id === 'printingPaper') {
          limitMaxValueForSide(widthParam, heightParam, param);
        }

        if (service.type.id === 'printingBanner') {
          const qualityParam = getParamByElementId('bannerQuality');

          if (widthParam.value < 1600 && heightParam.value < 1600) { // якщо ширина або висота більше 160см - 1400dpi недоступно
            addConditionalOptionsToParamOptions(qualityParam);
          } else {
            removeConditionalOptionsFromParamOptins(qualityParam);
          }
        }
        break;
      }

      default: break;
    }

    validateNumber(param);
  };

  const onParamSelectChange = ({ target }) => {
    const param = getParamByElementId(target.id);

    switch (param.id) {
      case 'lettersFontFamily':
        setInputFontFamily(param);
        break;
      case 'paperMaterial': // якщо матеріал "Blue-back" - додати якість 360dpi
        const qualityParam = getParamByElementId('paperQuality');
        if (param.value.id === 'paperBlueBack') {
          addConditionalOptionsToParamOptions(qualityParam, 'beforeend');
        } else {
          removeConditionalOptionsFromParamOptins(qualityParam);
        }
        break;
      case 'numberPlateMaterial':
      case 'letterMaterial':
      case 'lightboxMaterial': // при зміні матеріалу - відобразити дод. поля
        param.subparams = param.conditionalParams.filter(({ forOptionId }) => forOptionId === param.value.id);
        break;
      default:
        break;
    }
  };

  const setPocketsCountValue = (param, subparam) => {
    const paramSquare = getParamSquare();
    const { width, height } = paperFormats.find(({ name }) => name === subparam.value.name);
    const maxPocketsCount = Math.floor(paramSquare / (width * height * 1.2));
    param.value = maxPocketsCount < param.value ? maxPocketsCount : param.value;
  };

  const onSubparamSelectChange = (param, subparam) => {
    if (param.id === 'standPockets') {
      if (subparam.value.name) {
        setPocketsCountValue(param, subparam);
      }
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

  const roundPrice = (price) => Math.round(price);

  const calcLuversPrice = () => {
    const widthParam = getParamByElementId('width');
    const heightParam = getParamByElementId('height');
    const luversParam = getParamByElementId('bannerLuvers');
    const stepBetweenEyelets = 0.3; // крок між люверсами
    const anglesNumber = 4;
    const sidesNumber = 4;
    const width = widthParam.value / 1000;
    const height = heightParam.value / 1000;

    switch (luversParam.value.id) {
      case 'luversOption1': // "Без люверсовки"
        return 0;
      case 'luversOption2': // "По периметру"
        return Math.ceil(getParamPerimeter() / stepBetweenEyelets) * luversParam.price;
      case 'luversOption3': // "По кутам"
        return anglesNumber * luversParam.price;
      case 'luversOption4': // "По кутам і середині"
        return (anglesNumber + sidesNumber) * luversParam.price;
      case 'luversOption5': // "Тільки верх"
      case 'luversOption6': // "Тільки низ"
        return Math.ceil(width / stepBetweenEyelets) * luversParam.price;
      case 'luversOption7': // "Верх і низ"
        return Math.ceil(width / stepBetweenEyelets) * 2 * luversParam.price;
      case 'luversOption8': // "Ліво і право"
        return Math.ceil(height / stepBetweenEyelets) * 2 * luversParam.price;
      default:
        return 0;
    }
  };

  const calcSolderingPrice = () => {
    const solderingParam = getParamByElementId('bannerSoldering');
    const perimeter = getParamPerimeter();
    return perimeter * solderingParam.value.price;
  };

  const calcPipePocketPrice = () => {
    const widthParam = getParamByElementId('width');
    const heightParam = getParamByElementId('height');
    const pipePocketParam = getParamByElementId('bannerPipePocket');

    switch (pipePocketParam.value.id) {
      case 'pipePocketOption1': // "Без карману"
        return 0;
      case 'pipePocketOption2': // "Тільки зверху"
      case 'pipePocketOption3': // "Тільки знизу"
        return widthParam.value / 1000 * pipePocketParam.price;
      case 'pipePocketOption4': // "Тільки зліва"
      case 'pipePocketOption5': // "Тільки справа"
        return heightParam.value / 1000 * pipePocketParam.price;
      case 'pipePocketOption6': // "Верх і низ"
        return widthParam.value * 2 / 1000 * pipePocketParam.price;
      case 'pipePocketOption7': // "Ліво і право"
        return heightParam.value * 2 / 1000 * pipePocketParam.price;
      case 'pipePocketOption8': // "По периметру"
        return heightParam.value * 2 / 1000 * pipePocketParam.price;
      default:
        return 0;
    }
  };

  const calcPocketsPrice = () => {
    const pocketsCountParam = getParamByElementId('standPockets');

    if (pocketsCountParam.value > 0 && pocketsCountParam.subparams) {
      const pocketSize = pocketsCountParam.subparams.find(({ id }) => id === 'standPocketsSize');
      return pocketsCountParam.value * pocketSize.value.price || 0;
    }

    return 0;
  };

  const calcParamSelectsPrice = (params = [], size = 1) => (
    params
      .filter((param) => param.type === 'select')
      .reduce((acc, param) => acc + (param.value.price * size || 0), 0)
  );

  const isAllParamsChosenAndValid = (params) => {
    const selectsValid = params.filter(({ type }) => type === 'select').every(({ value }) => value.name);
    const textsValid = params.filter(({ type }) => type === 'text').every(({ value }) => value.trim().length);
    const numbersValid = params.filter(({ type }) => type === 'number').every(({ valid }) => valid);

    return selectsValid && textsValid && numbersValid;
  };

  $: if (service.params) {
    allParamsChosenAndValid = isAllParamsChosenAndValid(service.params);
  }

  $: if (service.id === 'printing' && service.params) {
    const { price, params, additionals } = service;
    const square = getParamSquare();
    const paramsSelectsPrice = calcParamSelectsPrice(params, square);

    const urgentParam = additionals.find((i) => (i.id === 'urgentProd24' || i.id === 'urgentProd4') && i.checked);
    const urgentCoefficient = urgentParam ? urgentParam.coefficient : 1;

    totalPrice = roundPrice((price * square + paramsSelectsPrice) * urgentCoefficient);

    if (service.type.id === 'printingFilm') {
      const additionalCheckboxesPrice = additionals
        .filter((i) => i.type === 'checkbox' && i.checked)
        .reduce((acc, i) => {
          const price = i.price * square;
          const minPrice = i.minPrice || 0;
          const calcPrice = price > minPrice ? price : minPrice;
          return acc + (calcPrice || 0);
        }, 0);

      totalPrice = roundPrice((price * square + paramsSelectsPrice + additionalCheckboxesPrice) * urgentCoefficient);
    }

    if (service.type.id === 'printingBanner') {
      const paramsSelectsPrice = params
        .filter(({ id }) => id === 'bannerMaterial' || id === 'bannerQuality')
        .reduce((acc, param) => acc + (param.value.price * square || 0), 0);

      const bannerParamsPrice = paramsSelectsPrice + calcLuversPrice() + calcSolderingPrice() + calcPipePocketPrice();

      totalPrice = roundPrice((price * square + bannerParamsPrice) * urgentCoefficient);
    }
  }

  $: if (service.id === 'letters') {
    const heightParam = getParamByElementId('letterHeight');
    const textParam = getParamByElementId('lettersText');
    const materialParam = getParamByElementId('letterMaterial');

    const letterHeight = heightParam.value / 10;
    const lettersTextLength = textParam.value ? textParam.value.replace(/\s/g, '').length : 0;

    const paramsSelectsPrice = calcParamSelectsPrice(service.params, letterHeight);
    const materialSubparamsPrice = calcParamSelectsPrice(materialParam.subparams, letterHeight);

    totalPrice = roundPrice((paramsSelectsPrice + materialSubparamsPrice) * lettersTextLength);
  }

  $: if (service.id === 'lightbox') {
    const square = getParamSquare();
    const materialParam = getParamByElementId('lightboxMaterial');
    const materialSubparamsPrice = calcParamSelectsPrice(materialParam.subparams, square);

    totalPrice = roundPrice(materialParam.value.price + materialSubparamsPrice);
  }

  $: if (service.id === 'numberPlate') {
    const square = getParamSquare();
    const materialParam = getParamByElementId('numberPlateMaterial');
    const paramsSelectsPrice = calcParamSelectsPrice(service.params, square);
    const materialSubparamsPrice = calcParamSelectsPrice(materialParam.subparams, square);

    totalPrice = roundPrice(paramsSelectsPrice + materialSubparamsPrice);
  }

  $: if (service.id === 'stand') {
    const square = getParamSquare();
    const paramsSelectsPrice = calcParamSelectsPrice(service.params, square);

    totalPrice = roundPrice(paramsSelectsPrice + calcPocketsPrice());
  }

  $: if (service.id === 'stender') {
    const paramsSelectsPrice = calcParamSelectsPrice(service.params);

    totalPrice = roundPrice(paramsSelectsPrice);
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
                      <ParamItem
                        bind:param={subparam}
                        onSelectChange={() => onSubparamSelectChange(param, subparam)}
                      />
                    {/each}
                  {/if}
                {/each}
              </ul>
            </fieldset>
          {/if}

          {#if allParamsChosenAndValid && service.additionals && service.additionals.length}
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
