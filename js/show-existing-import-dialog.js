if(document.body.dataset.tbaTheme) {
  if(document.body.dataset.tbaTheme === 'dark')
    document.body.classList.add(document.body.dataset.tbaTheme);
  wrapper.classList.remove('hidden');
  mainContainer.classList.remove('hidden');
  pre.classList.add('hidden');
  true;
} else false;