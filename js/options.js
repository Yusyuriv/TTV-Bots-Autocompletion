const theme = {
  light: document.querySelector('[name="theme"][value="light"]'),
  dark: document.querySelector('[name="theme"][value="dark"]')
};

const useServer = document.querySelector('#use-server');

const searchType = {
  strict: document.querySelector('[name="search-type"][value="strict"]'),
  loose: document.querySelector('[name="search-type"][value="loose"]')
};

const searchDescriptions = document.querySelector('#search-descriptions');

const listCache = document.querySelector('#cache-list');
const listImport = document.querySelector('#import-list');

const buttonClearCache = document.querySelector('#clear-cache');
const buttonClearImported = document.querySelector('#clear-imported');
const buttonExportImported = document.querySelector('#export-imported');

function setListHeadersVisibility() {
  const listCacheClass = listCache.textContent.trim() ? 'block' : 'none';
  const listImportClass = !!listImport.textContent.trim() ? 'block' : 'none';

  buttonClearCache.style.display
    = listCache.previousElementSibling.style.display
    = listCacheClass;
  buttonClearImported.style.display
    = listImport.previousElementSibling.style.display
    = buttonExportImported.style.display
    = listImportClass;
}
function restore() {
  chrome.storage.local.get({
    [PREFIXES.CHANNEL]: [],
    [PREFIXES.PRESET]: [],
    theme: 'light',
    useServer: true,
    searchType: 'loose',
    searchDescriptions: false
  }, data => {
    theme[data.theme].checked = true;
    searchType[data.searchType].checked = true;

    listCache.textContent = data[PREFIXES.CHANNEL].join(', ');
    listImport.textContent = data[PREFIXES.PRESET].join(', ');
    setListHeadersVisibility();

    useServer.checked = data.useServer;
    searchDescriptions.checked = data.searchDescriptions;
  });
}

function onStorageChange(changes, ns) {
  if(ns !== 'local')
    return;

  for(let change in changes) {
    switch(change) {
      case 'theme':
        theme[changes[change].newValue || 'light'].checked = true;
        break;
      case 'searchType':
        searchType[changes[change].newValue || 'loose'].checked = true;
        break;
      case 'useServer':
        useServer.checked = changes[change].newValue || false;
        break;
      case 'searchDescriptions':
        searchDescriptions.checked = changes[change].newValue || false;
        break;
      case PREFIXES.CHANNEL:
      case PREFIXES.PRESET:
        (change === PREFIXES.CHANNEL
          ? listCache
          : listImport).textContent = (changes[change].newValue || []).join(', ');
        setListHeadersVisibility();
        break;
    }
  }
}
const overlay = document.querySelector('#confirm');
const question = document.querySelector('#confirm-text');
const yesBtn = document.querySelector('#confirm-yes');
const noBtn = document.querySelector('#confirm-no');

function noop(){}
function confirmOverlay(params = {}) {
  params.question = params.question || 'Are you sure?';
  params.yesText = params.yesText || 'Yes';
  params.yes = params.yes || noop;
  params.noText = params.noText || 'No';
  params.no = params.no || noop;

  question.textContent = params.question;
  yesBtn.textContent = params.yesText;
  noBtn.textContent = params.noText;

  yesBtn.addEventListener('click', yesCb);
  noBtn.addEventListener('click', noCb);

  overlay.style.display = 'flex';

  function removeListeners() {
    overlay.style.display = 'none';

    yesBtn.removeEventListener('click', yesCb);
    noBtn.removeEventListener('click', noCb);
  }
  function yesCb() {
    params.yes();
    removeListeners();
  }
  function noCb() {
    params.no();
    removeListeners();
  }
}
function saveTheme(e) {
  if(e.currentTarget.checked)
    chrome.storage.local.set({ theme: e.currentTarget.value });
}
function saveSearchType(e) {
  if(e.currentTarget.checked)
    chrome.storage.local.set({ searchType: e.currentTarget.value });
}
function saveUseServer(e) {
  chrome.storage.local.set({ useServer: e.currentTarget.checked })
}
function saveSearchDescriptions(e) {
  chrome.storage.local.set({ searchDescriptions: e.currentTarget.checked })
}
function beforeClearPresets() {
  confirmOverlay({
    question: "Are you sure you want to delete all manually imported commands?\nThis action is irreversible.",
    yes: clearPresets
  });
}

chrome.storage.onChanged.addListener(onStorageChange);

theme.light.addEventListener('change', saveTheme);
theme.dark.addEventListener('change', saveTheme);

searchType.loose.addEventListener('change', saveSearchType);
searchType.strict.addEventListener('change', saveSearchType);

useServer.addEventListener('change', saveUseServer);
searchDescriptions.addEventListener('change', saveSearchDescriptions);

buttonClearCache.addEventListener('click', clearCache);
buttonClearImported.addEventListener('click', beforeClearPresets);
buttonExportImported.addEventListener('click', exportPresets);

restore();