chrome.runtime.onMessage.addListener(msg => {
  if (msg === 'closeTab')
    chrome.tabs.query({currentWindow: true, active: true}, tabs => {
      if (!tabs.length)
        return;
      chrome.tabs.remove(tabs[0].id);
    })
});