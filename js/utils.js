function search(string, query, type = 'loose') {
  let res = string;
  string = string.toLowerCase();
  query = query.toLowerCase();
  if(type === 'strict') {
    const index = string.indexOf(query);
    if(index === -1)
      return false;
    res = res.substr(0, index)
      + `<strong>${res.substr(index, query.length)}</strong>`
      + res.substr(index + query.length);
    return res;
  } else {
    let last = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query[i];
      const index = res.indexOf(char, last);
      if (index === -1) {
        return false;
      }
      res = res.substr(0, index) + `<strong>${char}</strong>` + res.substr(index + 1);
      last = index + 18;
    }

    return res;
  }
}
function searchByName(arr, name) {
  for(const elem of arr)
    if(elem.name === name)
      return elem;
  return null;
}
function escapeHTML(html) {
  if(!html)
    return '';
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}