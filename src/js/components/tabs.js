const tabLists = document.querySelectorAll('[data-tab-list]');

tabLists.forEach((tabList) => {
  const tabs = tabList.querySelectorAll('[data-tab]');
  const activeTab = tabList.querySelector('[data-tab].active');

  const tabContentList = document.getElementById(tabList.dataset.tabList);
  const tabPanels = tabContentList.querySelectorAll('[data-tab-panel]');

  tabPanels.forEach((tabPanel) => tabPanel.classList.add('hidden'));

  tabs.forEach((tab) => {
    tab.addEventListener('click', (evt) => {
      evt.preventDefault();
      tabList.querySelector('[data-tab].active').classList.remove('active');
      tab.classList.add('active');

      tabPanels.forEach((tabPanel) => tabPanel.classList.add('hidden'));
      tabContentList.querySelector(tab.hash).classList.remove('hidden');
    });
  });

  activeTab.click();
});
