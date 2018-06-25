
function _appendChildren (parent, nodes, ns_scheme, options) {
  var node, node_el;
  for( var i = 0, n = nodes.length ; i < n ; i++ ) {
    node = nodes[i];
    node_el = _create(node, parent, ns_scheme, options);
    parent.appendChild( node_el );
    if( node._init instanceof Array ) node._init.forEach(function (initFn) {
      initFn.call(node_el);
    });
  }
}

var ns_tags = {
  svg: 'http://www.w3.org/2000/svg',
  xbl: 'http://www.mozilla.org/xbl',
  xul: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
};

function _create(node, _parent, ns_scheme, options) {
  var node_el;
  if( node.$ ) {
    ns_scheme = ns_scheme || ns_tags[node.$];
    if( ns_scheme ) node_el = document.createElementNS(ns_scheme, node.$);
    else node_el = document.createElement(node.$);

    if( node.attrs ) {
      for( var key in node.attrs ) node_el.setAttribute(key, node.attrs[key]);
    }
    if( node._ instanceof Array ) _appendChildren(node_el, node._, ns_scheme, options);
    else if( node._ ) node_el.textContent = node._;

    if( options.init && options.init[node.$] instanceof Function ) options.init[node.$].call(node_el, node_el);
  } else if( node.text ) return document.createTextNode(node.text);

  return node_el;
}

module.exports = function renderNodes (parent, nodes, options) {
  while( parent.firstChild ) parent.removeChild(parent.firstChild);
  _appendChildren(parent, nodes, null, options || {});
  return nodes;
};
