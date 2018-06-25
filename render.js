
function _appendChildren (parent, nodes) {
  var node, node_el;
  for( var i = 0, n = nodes.length ; i < n ; i++ ) {
    node = nodes[i];
    node_el = _create(node, parent);
    // console.log('_create', nodes[i], node_el, node);
    parent.appendChild( node_el );
    if( node._init instanceof Array ) node._init.forEach(function (initFn) {
      initFn.call(node_el);
    });
  }
}

function _create(node, _parent) {
  var node_el;
  if( node.$ ) {
    node_el = document.createElement(node.$);
    if( node.attrs ) {
      for( var key in node.attrs ) node_el.setAttribute(key, node.attrs[key]);
    }

    // console.log('_create:children %c' + node.$, 'color: blue; font-weight: bold', node._ instanceof Array, node._ );
    if( node._ instanceof Array ) _appendChildren(node_el, node._);
    else if( node._ ) node_el.textContent = node._;
  } else if( node.text ) return document.createTextNode(node.text);
  // console.log('_create %c' + node.$, 'color: brown; font-weight: bold', node, node_el.outerHTML );

  return node_el;
}

module.exports = function renderNodes (parent, nodes) {
  // console.log('renderNodes', parent, nodes);
  _appendChildren(parent, nodes);
};
