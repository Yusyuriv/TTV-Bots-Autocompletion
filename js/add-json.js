const REGEXP_LINK = /((?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,20}(?:(?:\/(?:[/~\w.\-?=+%]|&amp;)*)?[/~\w])?)/gi;
function tryJson(str) {
  if(!str)
    return null;
  if(str.length > 1024 * 1024 * 10)
    return null;
  let json = null;
  try {
    let tmp = str
      .replace(/^(  )?([- ] name:)\s+([^'"].*)$/gm, '\n$1$2 >-\n$1    $3')
      .replace(/^(  )?([- ]   text:)\s+([^>|'"].*)$/gm, '$1$2 >-\n$1      $3');
    json = jsyaml.safeLoad(tmp, { schema: jsyaml.FAILSAFE_SCHEMA });
  } catch(e) {}
  if(!json) {
    try {
      json = JSON.parse(str);
    } catch(e) {}
  }
  if(!json)
    return null;
  if(json instanceof Array)
    return null;

  const ajv = new Ajv;
  return ajv.validate(schema, json) ? json : null;
}

let json = tryJson(document.body.textContent);
if(json) {
  chrome.storage.local.get({
    theme: 'light'
  }, data => {
    if(data.theme === 'dark')
      document.body.classList.add('dark');
  });
  for(const channelName in json) {
    if(!json.hasOwnProperty(channelName))
      continue;

    const channel = json[channelName];
    for(const command of channel) {
      for(const description of command.descriptions) {
        if (typeof description.groups !== 'string')
          description.groups = description.groups.join(', ');
      }
    }
    channel.sort((a, b) => {
      a = a.name.toLowerCase();
      b = b.name.toLowerCase();
      if(a.startsWith('!') || a.startsWith('~'))
        a = a.substr(1);
      if(b.startsWith('!') || b.startsWith('~'))
        b = b.substr(1);
      if(a < b)
        return -1;
      if(a > b)
        return 1;
      return 0;
    })
  }
}

function addButton(parent, text, cb) {
  const link = document.createElement('button');
  link.textContent = text;
  parent.appendChild(link);
  link.addEventListener('click', cb);
}
function closeTab() {
  alert('Commands imported successfully.');
  chrome.runtime.sendMessage('closeTab');
}
function yes(e) {
  e.preventDefault();

  importPresets(json, closeTab);
}
function no(e) {
  e.preventDefault();
  wrapper.parentNode.removeChild(wrapper);
  mainContainer.parentNode.removeChild(mainContainer);
  pre.classList.remove('hidden');
  document.body.classList.remove('dark');
  json = null;
}
let wrapper, mainContainer, pre = document.querySelector('pre');
function parseLinks(str) {
  return str.replace(REGEXP_LINK, (match, p1) => {
    let link = p1;
    if(!/^https?:\/\//i.test(p1))
      link = 'http://' + p1;
    return `<a href="${link}" rel="noopener noreferrer" target="_blank">${p1}</a>`;
  });
}

function channel(channelName) {
  let result = `<div class="channel">
    <div class="channel-name">
      <span class="channel-name-arrow">&blacktriangleright;</span>
      ${escapeHTML(channelName)}
    </div>
    <div class="hidden channel-commands">`;
  for(let c of json[channelName])
    result += command(c);
  result += `</div></div>`;
  return result;
}
function command(c) {
  return `<div>
    <span class="command-name">${escapeHTML(c.name)}</span>
    ` +
      c.descriptions.map(v => `<div class="command-description">
          <div class="command-groups">${v.groups}</div>
          <div class="command-text">${parseLinks(escapeHTML(v.text))}</div>
        </div>`).join('')
    + `
  </div>`;
}
function toggleChannel(e){
  if(!e.target.classList.contains('channel-name'))
    return;
  e.target.querySelector('.channel-name-arrow').classList.toggle('open');
  e.target.nextElementSibling.classList.toggle('hidden');
}

function onStorageChange(changes, ns) {
  if(ns !== 'local')
    return;
  if(!changes.theme)
    return;
  if(!json)
    return;

  document.body.classList[
    changes.theme.newValue === 'dark' ? 'add' : 'remove'
  ]('dark');
}

if(json) {
  document.querySelector('pre').classList.add('hidden');

  wrapper = document.createElement('div');
  wrapper.className = 'wrapper';
  wrapper.innerHTML = "Add/Replace the autocompletion for these commands on these channels?<br>";
  addButton(wrapper, 'Yes', yes);
  addButton(wrapper, 'No', no);

  document.body.appendChild(wrapper);

  mainContainer = document.createElement('div');
  mainContainer.className = 'main-container';

  let result = '';
  for(let channelName in json) {
    result += channel(channelName);
  }

  mainContainer.innerHTML = result;
  document.body.appendChild(mainContainer);

  mainContainer.addEventListener('click', toggleChannel);

  toggleChannel({ target: document.querySelector('.channel-name') });

  chrome.storage.onChanged.addListener(onStorageChange);

  document.body.addEventListener('click', e => {
    if(e.target.tagName === 'A')
      if(!confirm("Links can be scary. Are you sure you want to open it?")) {
        e.preventDefault();
        e.stopPropagation();
      }
  });
}
pre.classList.add('visible');