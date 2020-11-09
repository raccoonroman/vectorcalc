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
  let chosenParams = [];

  const URGENT_PROD_24 = 'urgentProd24';
  const URGENT_PROD_4 = 'urgentProd4';

  onMount(async () => {
    const responce = await fetch('/calc.json');
    services = await responce.json();
  });

  const openPopup = (evt) => { // відкрити попап
    const popupName = evt.currentTarget.dataset.openPopup;
    const popup = document.querySelector(`[data-popup=${popupName}]`);
    popup.classList.remove('popup--hidden');
  };

  const closePopup = (evt) => { // закрити попап
    const popup = evt.target.closest('[data-popup]')
    popup.classList.add('popup--hidden');
  };

  const handleKeydown = (evt) => { // закрити попап клавішею Escape
    if (evt.key === 'Escape') {
      const popup = document.querySelector('[data-popup]:not(.popup--hidden)');
      if (popup) {
        popup.classList.add('popup--hidden');
      }
    }
  };

  const getParamByElementId = (id) => service.params.find((param) => id === param.id); // шукаємо параметр послуги за айдішніком

  const validateNumber = (param) => { // валідація номера в інпуті
    param.valid = param.value >= param.min && param.value <= param.max;
    service = service;
  };

  const setInputFontFamily = async (param) => { // відобразити змінений шрифт в текстовому інпуті, коли в селекті вибираємо сімейство шрифта
    await tick();
    const textInput = section.querySelector('#lettersText');
    const fontFamily = param.value.name || 'Roboto';
    textInput.style.fontFamily = `${fontFamily}, ${fontGeneric[fontFamily]}`;
  };

  const getParamSquare = () => { // вичисляємо площу вироба за шириною і висотою
    const width = getParamByElementId('width');
    const height = getParamByElementId('height');
    return width.value * height.value  / 1000000; // переводимо площу в метри
  };

  const getParamPerimeter = () => { // вичисляємо периметр вироба за шириною і висотою
    const width = getParamByElementId('width');
    const height = getParamByElementId('height');
    return (width.value + height.value) * 2 / 1000; // переводимо периметр в метри
  };


  const addConditionalOptionsToParamOptions = (param, position = 'afterend') => { // додаємо нові "option" до селекту, які залежать від якихось зовнішніх умов (напр., завеликий розмір виробу). Ці "option" беруться із одного додаткового свойства "param" і копіюються в основні. Можемо додати як на початок, так і в кінець, після основних "opyion".
    const { options, conditionalOptions } = param;
    // перевіряємо, чи я вже ці додаткові "option" в селекті, щоб не додавати зайвий раз
    const hasParamConditionalOptions = options.some((option) => (
      conditionalOptions.some(({ name }) => name === option.name)
    ));

    let newOptions;
    switch (position) { // вставляємо або на початок, або в кінець
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

  const removeConditionalOptionsFromParamOptins = (param) => { // аналогічно від ф-ції вище, але тут видаляємо неосновні "option" з селекту
    const { options, conditionalOptions } = param;
    param.options = options.filter(({ name }) => (
      !conditionalOptions.some((option) => option.name === name)
    ));
    const isParamValueFromConditionals = conditionalOptions.some((option) => option === param.value)
    param.value = isParamValueFromConditionals ? param.options[param.options.length - 1] : param.value; // встановлюємо останнє значення з нових "option", щоб не було ситуації, коли в селекті стоїть "option", якого вже насправді немає.
  };

  // form event listeners
  const onServiceChange = () => { // коли міняється тип послуги
    if (service.id === 'letters') { // відновити шрифт, коли міняється тип самої послуги
      const fontFamilyParam = getParamByElementId('lettersFontFamily');
      setInputFontFamily(fontFamilyParam);
    }
    if (service.id === 'stand') { // відразу додаємо додаткові "option" до селекту, при першому відображенні
      const materialParam = getParamByElementId('standMaterial');
      addConditionalOptionsToParamOptions(materialParam);
    }
  };

  const onServiceTypeChange = () => { // коди міняється поверхня для широкоформатного другу - підвантажуємо параметри
    const { price, params, additionals } = service.type instanceof Object ? service.type : {}
    service.price = price || null;
    service.params = params || null;
    service.additionals = additionals || null;
  };

  const onNumberFieldInput = ({ target }) => {
    const param = getParamByElementId(target.id);
    validateNumber(param);

    if (param.id === 'standPockets') { // коли встановили кількість кишень - відобразити додаткові поля
      param.subparams = param.value > 0 && param.conditionalParams;
    }
  };

  const limitMaxValueForSide = (widthParam, heightParam, currentParam) => { //обмежити максимальне значення для іншої сторони, якщо в поточної сторони встановили завелике значення.
    const setMaxValueForParam = (targetParam) => {
      const { limited, regular } = targetParam.conditionalMax;
      targetParam.max = currentParam.value > currentParam.conditionalMax.limited ? limited : regular;
    };

    if (currentParam.id === 'width') {
      setMaxValueForParam(heightParam);
    } else if (currentParam.id === 'height') {
      setMaxValueForParam(widthParam);
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
      case 'stand': { // якщо послуга "Стенд"
        const pocketsCountParam = getParamByElementId('standPockets');
        const materialParam = getParamByElementId('standMaterial');

        limitMaxValueForSide(widthParam, heightParam, param); // обмежили макс. значення для однієї зі сторін

        if (['width', 'height'].includes(param.id) && pocketsCountParam.subparams) { // коли змінилася площа стенду - перерахувати кількість кишень
          const pocketsSizeParam = pocketsCountParam.subparams.find(({ id }) => id === 'standPocketsSize');
          setPocketsCountValue(pocketsCountParam, pocketsSizeParam);
        }

        if (widthParam.value > 1500 || heightParam.value > 1500) { //якщо одна зі сторін більша ніж 1.5м - відобразити додаткові "option" для селекту матеріалів
          removeConditionalOptionsFromParamOptins(materialParam);
        } else {
          addConditionalOptionsToParamOptions(materialParam);
        }
        break;
      }
      case 'printing': {
        if (service.type.id === 'printingPaper') { // якщо широкоформатний друк на папері
          limitMaxValueForSide(widthParam, heightParam, param); // обмежити максимальне значення однієї зі сторін
        }

        if (service.type.id === 'printingBanner') { // якщо широкоформатний друк на банері
          const qualityParam = getParamByElementId('bannerQuality');

          if (widthParam.value < 1600 && heightParam.value < 1600) { // якщо ширина або висота більше 1.6м - 1400dpi недоступно
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
        service = service;
        break;
      default:
        break;
    }
  };

  const setPocketsCountValue = (param, subparam) => { // встановити кількість кишень для стенду, якщо введено більше ніж допустимо
    if (subparam.value.name) {
      const paramSquare = getParamSquare();
      const { width, height } = paperFormats.find(({ name }) => name === subparam.value.name);
      const maxPocketsCount = Math.floor(paramSquare / (width * height * 1.2));
      param.value = maxPocketsCount < param.value ? maxPocketsCount : param.value;
      service = service;
    }
  };

  const onSubparamSelectChange = (param, subparam) => {
    if (param.id === 'standPockets') { // коли змінили формат кишень - обновити максимальну кількість
      setPocketsCountValue(param, subparam);
    }
  };

  const onToggleChange = (param) => { // коли змінили терміновий друк - вимкнути інший перемикач термінового друку, так як одночасно доступний може бути тільки один
    const allParams = [...service.params, ...service.additionals];

    if (param.id === URGENT_PROD_24 && param.checked) {
      const urgentProd4 = allParams.find(({ id }) => id === URGENT_PROD_4);
      if (urgentProd4) {
        urgentProd4.checked = false;
        service = service;
      }
    }

    if (param.id === URGENT_PROD_4 && param.checked) {
      const urgentProd24 = allParams.find(({ id }) => id === URGENT_PROD_24);
      if (urgentProd24) {
        urgentProd24.checked = false;
        service = service;
      }
    }
  };
  // end form event listeners

  const getAllParamValues = (service) => { // збираємо всі дані, щоб відправити на бек.
    const { params, additionals } = service;
    const allParams = [...params, ...additionals];

    const iter = (params) => {
      return params.map((param) => {
        const { type, label, value, checked, subparams } = param;

        if (subparams) {
          return [[label, value.name || value], iter(subparams).flat(2)];
        }

        if (type === 'checkbox' || type === 'toggle') {
          return checked ? [[label, checked]] : [];
        }

        return [[label, value.name || value]];
      });
    };

    return iter(allParams).flat();
  };

  const onSummaryBtnClick = (evt) => {
    openPopup(evt);

    const paramValues = getAllParamValues(service);

    chosenParams = paramValues;
  };

  const calcLuversPrice = () => { // рахуємо ціну люверсів за формулою
    const widthParam = getParamByElementId('width');
    const heightParam = getParamByElementId('height');
    const luversParam = getParamByElementId('bannerLuvers');
    const stepBetweenEyelets = 0.3; // крок між люверсами
    const anglesNumber = 4;
    const sidesNumber = 4;
    const width = widthParam.value / 1000;
    const height = heightParam.value / 1000;

    if (!luversParam) return 0;

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

  const calcSolderingPrice = () => { // рахуємо ціну спайки за формулою
    const solderingParam = getParamByElementId('bannerSoldering');
    if (!solderingParam) return 0;

    const perimeter = getParamPerimeter();
    return perimeter * solderingParam.value.price;
  };

  const calcPipePocketPrice = () => { // рахуємо ціну карману під трубу за формулою
    const widthParam = getParamByElementId('width');
    const heightParam = getParamByElementId('height');
    const pipePocketParam = getParamByElementId('bannerPipePocket');

    if (!pipePocketParam) return 0;

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

  const calcPocketsPrice = () => { // рахуємо ціну для карманів стенду
    const pocketsCountParam = getParamByElementId('standPockets');

    if (pocketsCountParam.value > 0 && pocketsCountParam.subparams) {
      const pocketSize = pocketsCountParam.subparams.find(({ id }) => id === 'standPocketsSize');
      return pocketsCountParam.value * pocketSize.value.price || 0;
    }

    return 0;
  };

  const calcParamSelectsPrice = (params = [], size = 1) => (
    params // рахуємо ціну всіх параметрів (селектів)
      .filter((param) => param.type === 'select')
      .reduce((acc, param) => acc + (param.value.price * size || 0), 0)
  );

  const isAllParamsChosenAndValid = (params) => { // перевіряємо, чи всі поля валідні
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

    totalPrice = Math.round((price * square + paramsSelectsPrice) * urgentCoefficient);

    if (service.type.id === 'printingFilm') {
      const additionalCheckboxesPrice = additionals
        .filter((i) => i.type === 'checkbox' && i.checked)
        .reduce((acc, i) => {
          const price = i.price * square;
          const minPrice = i.minPrice || 0;
          const calcPrice = price > minPrice ? price : minPrice;
          return acc + (calcPrice || 0);
        }, 0);

      totalPrice = Math.round((price * square + paramsSelectsPrice + additionalCheckboxesPrice) * urgentCoefficient);
    }

    if (service.type.id === 'printingBanner') {
      const paramsSelectsPrice = params
        .filter(({ id }) => id === 'bannerMaterial' || id === 'bannerQuality')
        .reduce((acc, param) => acc + (param.value.price * square || 0), 0);

      const bannerParamsPrice = paramsSelectsPrice + calcLuversPrice() + calcSolderingPrice() + calcPipePocketPrice();

      totalPrice = Math.round((price * square + bannerParamsPrice) * urgentCoefficient);
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

    totalPrice = Math.round((paramsSelectsPrice + materialSubparamsPrice) * lettersTextLength);
  }

  $: if (service.id === 'lightbox') {
    const square = getParamSquare();
    const materialParam = getParamByElementId('lightboxMaterial');
    const materialSubparamsPrice = calcParamSelectsPrice(materialParam.subparams, square);

    totalPrice = Math.round(materialParam.value.price + materialSubparamsPrice);
  }

  $: if (service.id === 'numberPlate') {
    const square = getParamSquare();
    const materialParam = getParamByElementId('numberPlateMaterial');
    const paramsSelectsPrice = calcParamSelectsPrice(service.params, square);
    const materialSubparamsPrice = calcParamSelectsPrice(materialParam.subparams, square);

    totalPrice = Math.round(paramsSelectsPrice + materialSubparamsPrice);
  }

  $: if (service.id === 'stand') {
    const square = getParamSquare();
    const paramsSelectsPrice = calcParamSelectsPrice(service.params, square);

    totalPrice = Math.round(paramsSelectsPrice + calcPocketsPrice());
  }

  $: if (service.id === 'stender') {
    const paramsSelectsPrice = calcParamSelectsPrice(service.params);

    totalPrice = Math.round(paramsSelectsPrice);
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
      <div class="params">
        <h3>Послуга: {service.name}</h3>
        <table style="border-collapse: collapse;">
          {#each chosenParams as [label, value]}
            <tr>
              <th style="border: 1px solid #CCC;">{label}</th>
              <td style="border: 1px solid #CCC;">{value}</td>
            </tr>
          {/each}
        </table>
        {totalPrice}
      </div>
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
