const API_KEY = '08ZJvhr2X2hBzNpC4GNw8zEGXLJtOSqd';

const TIME_DELAY = 1000 * 60 * 30;

let commands = [], autoCommands = [], presetCommands = [];

const NOT_FOUND_MESSAGE = `<div style="text-align: center">
  No commands found by your request
  <img class="emoticon" src="https://static-cdn.jtvnw.net/emoticons/v1/86/1.0">
</div>`;
let inputContainer;
let input;
function isFullyVisible(el) {
  let top = el.offsetTop;
  let bottom = top + el.offsetHeight;
  let scrollTop = el.parentNode.scrollTop;
  let scrollHeight = scrollTop + el.parentNode.clientHeight;
  return top - scrollTop >= 0 && bottom - scrollHeight <= 0;
}
function enterCommand(suggestion) {
  let commandName = suggestion.dataset.name;
  let command = commands.filter(v => v.name === commandName)[0];

  let inputtedCommand = input.value.trim().split(' ')[0].trim();
  if(inputtedCommand !== command.name)
    input.value = command.name + ' ';
  hideSuggestions();
}
function scrollCommands(suggestion, key) {
  let suggestions = suggestion.parentNode;
  suggestion.classList.remove('highlighted');
  let toHighlight;
  if (key === 'ArrowDown') {
    toHighlight = suggestion.nextElementSibling;
    if (!toHighlight)
      toHighlight = suggestions.children[0];
  } else if (key === 'ArrowUp') {
    toHighlight = suggestion.previousElementSibling;
    if (!toHighlight)
      toHighlight = suggestions.children[suggestions.children.length - 1];
  }
  toHighlight.classList.add('highlighted');

  if (!isFullyVisible(toHighlight)) {
    toHighlight.scrollIntoView(key === 'ArrowUp');
  }
}
const ALLOWED_KEYS_WHEN_CHOOSING_COMMAND = [
  'ArrowDown', 'ArrowUp', 'Enter', 'Tab'
];
const KEYS_UP_DOWN = ALLOWED_KEYS_WHEN_CHOOSING_COMMAND.slice(0, 2);
const KEYS_THAT_CHOOSE_COMMAND = ALLOWED_KEYS_WHEN_CHOOSING_COMMAND.slice(2);
function upDownHandler(e) {
  if(e.key === 'Escape') {
    hideSuggestions();
    e.preventDefault();
  }
  if(!ALLOWED_KEYS_WHEN_CHOOSING_COMMAND.includes(e.key))
    return;
  let suggestions = document.querySelector('.tba-suggestions');
  if(!suggestions)
    return;
  let suggestion = suggestions.querySelector('.highlighted');

  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  if(KEYS_UP_DOWN.includes(e.key)) {
    scrollCommands(suggestion, e.key);
  } else if(KEYS_THAT_CHOOSE_COMMAND.includes(e.key)) {
    enterCommand(suggestion);
  }
}
let lastValue;
function keyUpHandler(e) {
  let suggestionsContainer = document.querySelector('.tba-suggestions');
  if (!suggestionsContainer && !(e.ctrlKey && e.key === ' '))
    return;
  if (suggestionsContainer && e.ctrlKey && e.key === ' ') {
    suggestionsContainer.parentNode.removeChild(suggestionsContainer);
    return;
  }

  if (lastValue === input.value && !(e.ctrlKey && e.key === ' '))
    return;
  lastValue = input.value;
  let suggestions = [];
  let text = input.value.trim().toLowerCase();
  let textCommand = text.split(' ')[0];
  for (let command of commands) {
    const foundName = search(escapeHTML(command.name), textCommand);
    if (foundName !== false)
      command.foundName = foundName;

    if(foundName) {
      suggestions.push(command);
    }
  }

  suggestions = suggestions.map((suggestion, i) => {
    let className = i === 0 ? ' highlighted' : '';
    let descriptions = [];
    for(let description of suggestion.descriptions) {
      descriptions.push(`<div class="tba-suggestion-usergroup"><b>${description.groups.join(', ')}:</b><br>${escapeHTML(description.text)}</div>`);
    }
    return `
        <div class="suggestion has-info${className}" data-name="${escapeHTML(suggestion.name)}">
          <div>${suggestion.foundName || escapeHTML(suggestion.name)}</div>
          <div>${descriptions.join('')}</div>
        </div>
    `;
  }).join('');
  suggestions = `<div class="suggestions tba-suggestions tba-suggestions-not-found">${suggestions || NOT_FOUND_MESSAGE}</div>`;
  inputContainer.querySelectorAll('.suggestions').forEach(v => {
    v.parentNode.removeChild(v);
  });
  inputContainer.insertAdjacentHTML('beforeend', suggestions);

  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  return false;
}
function hideSuggestions(e) {
  if(e) {
    setTimeout(hideSuggestions, 300);
    return;
  }
  let suggestions = inputContainer.querySelector('.tba-suggestions');
  if(suggestions)
    suggestions.parentNode.removeChild(suggestions);
}

function fixGroups(arr) {
  for(const command of arr) {
    for(const description of command.descriptions) {
      if(typeof description.groups === 'string')
        description.groups = [description.groups];
    }
  }
}
function joinCommands() {
  commands = autoCommands;
  for(const command of presetCommands) {
    let found = searchByName(commands, command.name);
    if(!found) {
      found = {
        name: command.name,
        descriptions: []
      };
      commands.push(found);
    }
    found.descriptions = found.descriptions.concat(command.descriptions);
  }
  fixGroups(commands);
  commands.sort((a, b) => {
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
  });
  console.log(commands);
}

function reqListener (username, channels) {
  autoCommands = JSON.parse(this.responseText);
  if(!channels.includes(username))
    channels.push(username);
  chrome.storage.local.set({
    [PREFIXES.LAST_UPDATE + username]: Date.now(),
    [PREFIXES.CHANNEL + username]: autoCommands,
    [PREFIXES.CHANNEL]: channels
  });
  joinCommands();
}

let observer = new MutationObserver(async function(mutations) {
  inputContainer = document.querySelector('.chat-input');
  if(!inputContainer || inputContainer.dataset.tbaAutocompleted)
    return;

  commands = [], autoCommands = [], presetCommands = [];

  inputContainer.dataset.tbaAutocompleted = true;
  input = inputContainer.querySelector('textarea');

  lastValue = '';

  document.body.addEventListener('keydown', e => {
    if(e.target.tagName === 'TEXTAREA' && e.target.parentNode.classList.contains('chat-input'))
      upDownHandler(e);
  }, true);
  document.body.addEventListener('keyup', e => {
    if(e.target.tagName === 'TEXTAREA' && e.target.parentNode.classList.contains('chat-input'))
      keyUpHandler(e);
  }, true);

  $(inputContainer)
    .on('click', '.tba-suggestions > .suggestion', e => {
      input.value = e.target.dataset.name;
      hideSuggestions();
    })
    .on('focusout', hideSuggestions);

  let username = location.href.match(/^https?:\/\/(?:www\.)twitch\.tv\/([a-z0-90-9_]+)(?:\/.*)?$/i);
  if(username)
    username = username[1];
  if(!username)
    return;
  username = username.toLowerCase();

  chrome.storage.local.get({
    [PREFIXES.LAST_UPDATE + username]: 0,
    [PREFIXES.CHANNEL + username]: [],
    [PREFIXES.PRESET + username]: [],
    [PREFIXES.CHANNEL]: [],
    useServer: true
  }, data => {
    autoCommands = data.useServer ? data[PREFIXES.CHANNEL + username] : [];
    presetCommands = data[PREFIXES.PRESET + username];
    joinCommands();
    if(Date.now() - data[PREFIXES.LAST_UPDATE + username] < TIME_DELAY)
      return;

    if(data.useServer) {
      let oReq = new XMLHttpRequest();

      oReq.addEventListener(
        "load", reqListener.bind(oReq, username, data[PREFIXES.CHANNEL])
      );
      oReq.open("GET", `https://ttv-bots.nastekali.party/api/channel/${username}`);
      oReq.setRequestHeader("X-API-Key", API_KEY);
      oReq.send();
    }
  });
});
observer.observe(document.body, {
  childList: true,
  subtree: true
});