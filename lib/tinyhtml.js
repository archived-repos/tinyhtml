
var parseHTML = require('./parser'),
    stringifyNodes = require('./stringify');

function tinyhtml (html, options) {
  return stringifyNodes( parseHTML(html, options), options );
}

tinyhtml.parse = parseHTML;
tinyhtml.stringify = stringifyNodes;

module.exports = tinyhtml;
