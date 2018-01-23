const REGEXP_POPOUT = /^https?:\/\/(?:www\.)?twitch\.tv\/(?:popout\/)?([^/]+)\/chat(?:\?popout=.*)?$/i;
const injected = {};
const contentScripts = chrome.runtime.getManifest().content_scripts[0];
async function inject(tabId, frameId, file, type = 'script') {
  type = type === 'script' ? 'executeScript' : 'insertCSS';
  return new Promise(resolve => chrome.tabs[type](tabId, { file, frameId }, resolve));
}
function executeScript(tabId, frameId, file) {
  return inject(tabId, frameId, file, 'script');
}
function insertCSS(tabId, frameId, file) {
  return inject(tabId, frameId, file, 'style');
}
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg === 'closeTab')
    chrome.tabs.query({currentWindow: true, active: true}, tabs => {
      if (!tabs.length)
        return;
      chrome.tabs.remove(tabs[0].id);
    });
  if (msg === 'injectIntoIframe') {
    if(!injected[sender.tab.id])
      injected[sender.tab.id] = [];
    chrome.webNavigation.getAllFrames({
      tabId: sender.tab.id
    }, async function(frames) {
      for(const frame of frames) {
        if(
          injected[sender.tab.id].includes(frame.frameId) ||
          !frame.url.match(REGEXP_POPOUT)
        )
          continue;
        for(const style of contentScripts.css)
          await insertCSS(sender.tab.id, frame.frameId, style);
        for(const script of contentScripts.js)
          await executeScript(sender.tab.id, frame.frameId, script);
        injected[sender.tab.id].push(frame.frameId);
      }
    });
  }
});
chrome.browserAction.onClicked.addListener(tab => {
  const IMPORT_REGEXP = /^(?:https?|file|ftp):\/\/.+\.ttv-bots\.(?:ya?ml|json)$/i;
  if(!IMPORT_REGEXP.test(tab.url))
    return;
  const CSS_FILES = ['/css/add-json'];
  const JS_FILES = [
    "/js/prefixes",
    "/js/utils",
    "/js/import-export",
    "/js/js-yaml.min",
    "/js/ajv.min",
    "/js/schema",
    "/js/add-json"
  ];
  let i = 0;
  function onExecuted() {
    if(i === JS_FILES.length)
      return;
    chrome.tabs.executeScript({
      file: JS_FILES[i++] + '.js'
    }, onExecuted);
  }
  chrome.tabs.executeScript({
    file: "/js/show-existing-import-dialog.js"
  }, data => {
    if(data && data.length)
      if(data[0])
        return;
    for(const css of CSS_FILES)
      chrome.tabs.insertCSS({
        file: css + '.css'
      });
    onExecuted();
  });
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(injected[tabId])
    delete injected[tabId];
});