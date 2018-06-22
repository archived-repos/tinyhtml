
function _stringifyAttrs(attrs) {
  var result = '', _quote;
  for( var key in attrs ) {
    if( key !== '$' && key !== '_' ) {
      _quote = /"/.test(attrs[key]) ? '\'' : '"';
      result += ' ' + key + '=' + _quote + attrs[key] + _quote;
    }
  }
  return result;
}

function unparseHTML (nodes) {

  return nodes.reduce(function (html, node) {
    return html +
      (node.$ ?
        ( '<' +node.$ + _stringifyAttrs(node) + '>') :
        node.text
      ) + (node._ ? unparseHTML(node._) : '');
  }, '');

}

module.exports = unparseHTML;
