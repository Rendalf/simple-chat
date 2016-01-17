// function that make string escaped and prevent XSS

// rules for replacing chars
const replaceRules = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};

// generate function
const escape = (function(toReplace) {
  const regExp = new RegExp(`[${Object.keys(toReplace).join('')}]`, "g");
  const tagReplace = tag => toReplace[tag];
  return (function(text) {
    return text.replace(regExp, tagReplace);
  });
})(replaceRules);

module.exports = escape;