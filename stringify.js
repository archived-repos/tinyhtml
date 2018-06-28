
function _stringifyAttrs(attrs) {
  var result = '', _quote;

  if( !attrs ) return result;

  for( var key in attrs ) {
    if( key !== '$' && key !== '_' ) {
      _quote = /"/.test(attrs[key]) ? '\'' : '"';
      result += ' ' + key;
      result += attrs[key] ? ('=' + _quote + attrs[key] + _quote) : '';
    }
  }

  return result;
}

function _renderAttrs () {
  return _stringifyAttrs(this.attrs);
}

function _processNode (_node, processor, options) {
  var node = Object.create(_node), result;

  if( processor instanceof Function ) {
    for( var key in _node ) {
      if( key !== '$' && key !== '_' ) node[key] = _node[key];
    }

    _node.__parent__ = _node;

    result = processor(node, function _renderChildren () {
      return this._ ? _stringifyNodes(this._, options) : '';
    }, _renderAttrs.bind(node) );

    if( typeof result === 'string' ) return result;
  }

  result = '';

  if( node.$ ) {
    result += '<' + ( node.self_closed ? '/' : '' ) + node.$ + _stringifyAttrs(node.attrs) + '>';
    if( '_' in node ) result += _stringifyNodes(node._, options);
    if( !node.unclosed ) result += '</' + node.$ + '>';
  } else if( node.comments ) {
    result += options.remove_comments === false ? ('<!--' + node._ + '-->') : '';
  } else {
    result += node.text || '';
  }

  return result;
}

function _stringifyNodes (nodes, options) {
  if( typeof nodes === 'string' ) return nodes;

  return nodes.reduce(function (html, node) {
    return html + _processNode(node, options.processors[node.$], options);
  }, '');

}

module.exports = function stringifyNodes (nodes, options) {
  options = options || {};
  options.processors = options.processors ||{};

  return _stringifyNodes(nodes, options);
};
