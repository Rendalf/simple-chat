// function for detect and insert smiles

// to replace
const smilesMap = {
  ":)": "http://s1.iconbird.com/ico/0512/circularicons/w16h161337840549smileysmile.png",
  ":-)": "http://s1.iconbird.com/ico/0512/circularicons/w16h161337840549smileysmile.png",
  "=)": "http://s1.iconbird.com/ico/0512/circularicons/w16h161337840549smileysmile.png",
  ":(": "http://s1.iconbird.com/ico/0512/circularicons/w16h161337840549smileyfrown.png",
  ":-(": "http://s1.iconbird.com/ico/0512/circularicons/w16h161337840549smileyfrown.png",
  "=(": "http://s1.iconbird.com/ico/0512/circularicons/w16h161337840549smileyfrown.png",
  ";)": "http://s1.iconbird.com/ico/0512/circularicons/w16h161337840549smileywink.png",
  "=P": "http://s1.iconbird.com/ico/0512/circularicons/w16h161337840549smileytounge.png",
  ":P": "http://s1.iconbird.com/ico/0512/circularicons/w16h161337840549smileytounge.png",
  ":-P": "http://s1.iconbird.com/ico/0512/circularicons/w16h161337840549smileytounge.png",
};

// generate function
const smilify = (function(smilesMap) {
  const replacer = smile => `<img src="${smilesMap[smile]}" alt="smile" />`;
  const smiles = Object.keys(smilesMap);
  return (function(text) {
    for (var i = smiles.length; i--;) {
      text = text.replace(smiles[i], replacer);
    }
    return text;
  });
})(smilesMap);

module.exports = smilify;