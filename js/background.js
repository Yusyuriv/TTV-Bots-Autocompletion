chrome.runtime.onMessage.addListener(msg => {
  if (msg === 'closeTab')
    chrome.tabs.query({currentWindow: true, active: true}, tabs => {
      if (!tabs.length)
        return;
      chrome.tabs.remove(tabs[0].id);
    })
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