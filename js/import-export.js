function noop(){}
function importPresets(json, cb) {
  if(!json)
    return;
  json = JSON.parse(JSON.stringify(json));
  const request = {
    [PREFIXES.PRESET]: []
  };
  const keys = Object.keys(json).map(v => {
    v = v.toLowerCase();
    const newKey = PREFIXES.PRESET + v;
    json[newKey] = json[v];
    delete json[v];
    return newKey;
  });
  for(const key of keys)
    request[key] = [];

  chrome.storage.local.get(request, data => {
    let sawDuplicate = false;
    let replaceOld = false;
    for(const presetName of keys) {
      const channelName = presetName.replace(PREFIXES.PRESET, '');
      if(!data[PREFIXES.PRESET].includes(channelName))
        data[PREFIXES.PRESET].push(channelName);
      else if(!sawDuplicate) {
        sawDuplicate = true;
        replaceOld = confirm("Seems like you're importing channels you've already imported before." +
          " Would you like to delete all old commands for these channels?")
      }
      if(replaceOld)
        data[presetName] = [];

      for(const command of json[presetName]) {
        const obj = searchByName(data[presetName], command.name);
        if(obj)
          obj.descriptions = command.descriptions;
        else
          data[presetName].push(command);
      }
    }
    chrome.storage.local.set(data, cb || noop);
  });
}
function sortCommands(a, b) {
  a = a.name.toLowerCase(), b = b.name.toLowerCase();
  if(a.startsWith('!') || a.startsWith('~'))
    a = a.substr(1);
  if(b.startsWith('!') || b.startsWith('~'))
    b = b.substr(1);

  if(a < b)
    return -1;
  if(a > b)
    return 1;
  return 0;
}
function sortKeys(a, b) {
  if (
    (a === 'name' && b === 'descriptions') ||
    (a === 'groups' && b === 'text')
  )
    return -1;
  if (
    (b === 'name' && a === 'descriptions') ||
    (b === 'groups' && a === 'text')
  )
    return 1;
  if (a < b)
    return -1;
  if (a > b)
    return 1;
  return 0;
}

function exportPresets() {
  chrome.storage.local.get({
    [PREFIXES.PRESET]: []
  }, data => {
    const request = {};
    data[PREFIXES.PRESET].forEach(v => {
      request[PREFIXES.PRESET + v] = [];
    });
    chrome.storage.local.get(request, data => {
      for(let key in data) {
        if(!data[key].length) {
          delete data[key];
          continue;
        }
        for(const command of data[key]) {
          command.descriptions.sort(sortCommands);
        }
        let newKey = key.replace(PREFIXES.PRESET, '');
        data[newKey] = data[key];
        delete data[key];
      }
      const blob = new Blob(
        [jsyaml.safeDump(data, {sortKeys})],
        {type: 'text/plain'}
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MyCommands.ttv-bots.yml';
      a.click();
    });
  });
}
function clearPresets() {
  chrome.storage.local.get({
    [PREFIXES.PRESET]: []
  }, data => {
    const toRemove = [PREFIXES.PRESET];
    data[PREFIXES.PRESET].forEach(v => {
      toRemove.push(PREFIXES.PRESET + v);
    });
    chrome.storage.local.remove(toRemove);
  });
}
function clearCache() {
  chrome.storage.local.get({
    [PREFIXES.CHANNEL]: []
  }, data => {
    const toRemove = [PREFIXES.CHANNEL];
    data[PREFIXES.CHANNEL].forEach(v => {
      toRemove.push(PREFIXES.CHANNEL + v);
      toRemove.push(PREFIXES.LAST_UPDATE + v);
    });
    chrome.storage.local.remove(toRemove);
  });
}