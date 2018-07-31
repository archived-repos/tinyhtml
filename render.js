
function _addInits (inits_list, node_el, tagInitFn, node_inits) {
  if( tagInitFn instanceof Function || node_inits instanceof Array ) inits_list.push(function () {
    if( tagInitFn ) tagInitFn.call(node_el, node_el);
    if( node_inits ) node_inits.forEach(function (initFn) {
      initFn.call(node_el, node_el);
    });
  });
}

function _appendChildren (parent, nodes, ns_scheme, options, inits_list) {
  var node, node_el;
  for( var i = 0, n = nodes.length ; i < n ; i++ ) {
    node = nodes[i];
    node_el = _create(node, parent, ns_scheme, options, inits_list);
    if( options.insert_before ) parent.insertBefore(node_el, options.insert_before);
    else parent.appendChild( node_el );
    _addInits(inits_list, node_el, options.init && options.init[node.$], node._init );
    if( options.initNode instanceof Function ) options.initNode(node_el, node);
  }
  options.insert_before = null;
}

var ns_tags = {
  svg: 'http://www.w3.org/2000/svg',
  xbl: 'http://www.mozilla.org/xbl',
  xul: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
};

function _create(node, _parent, ns_scheme, options, inits_list) {
  var node_el;
  if( node.$ ) {
    ns_scheme = ns_scheme || ns_tags[node.$];
    if( ns_scheme ) node_el = document.createElementNS(ns_scheme, node.$);
    else node_el = document.createElement(node.$);

    if( node.attrs ) {
      for( var key in node.attrs ) node_el.setAttribute(key, node.attrs[key]);
    }
    if( node._ instanceof Array ) _appendChildren(node_el, node._, ns_scheme, options, inits_list);
    else if( node._ ) node_el.textContent = node._;
  } else if( node.text ) return document.createTextNode(node.text);

  return node_el;
}

module.exports = function renderNodes (parent, nodes, options) {
  options = Object.create(options || {});
  if( !options.insert_before && options.keep_content !== true ) {
    while( parent.firstChild ) parent.removeChild(parent.firstChild);
  }
  var inits_list = [];
  _appendChildren(parent, nodes, null, options, inits_list);
  inits_list.forEach(function (initFn) { initFn(); });
  return nodes;
};
