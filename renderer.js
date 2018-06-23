
function _appendChildren (node, nodes) {
  var node_el;
  for( var i = 0, n = nodes.length ; i < n ; i++ ) {
    node_el = _create(nodes[i]);
    node.appendChild( node_el );
    if( nodes[i]._init instanceof Array ) nodes[i]._init.forEach(function (initFn) {
      initFn.call(node_el, node_el);
    });
  }
}

function _create(node) {
  var node_el = document.createElement(node.$);
  if( node.attrs ) for( var key in node.attrs ) node_el.setAttribute(key, node.attrs[key]);
  if( node._ instanceof Array ) _appendChildren(node_el, node._);
  else if( node._ ) node_el.textContent = node._;
}

module.exports = function renderNodes (parent, nodes) {
  _appendChildren(parent, nodes);
};
