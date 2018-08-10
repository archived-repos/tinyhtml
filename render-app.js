
var renderNodes = require('./render');

module.export = function renderApp (options) {
  return new App(options);
};

function _extend(dest, src) {
  for( var key in src ) dest[key] = src[key];
}

function _find(list, iteratee, this_arg) {
  for( var i = 0, n = list.length; i < n ; i++ ) {
    if( iteratee.call(this_arg, list[i]) ) return list[i];
  }
  return null;
}

function App (_options) {
  var options = Object.create(_options || {});

  options._with_node_pipe = [];

  this.options = options;
  this.components = {};
  this.directives = {};
}

App.prototype.render = function (parent, nodes, options) {
  var app = this,
      render_options = Object.create( this.options ),
      with_node_pipe = app.with_node_pipe;

  parent = parent || document.createElement('div');

  render_options.withNode = function (node) {
    var with_node = {},
        init_pipe = [],
        i, n;

    for( i = 0, n = with_node_pipe.length ; i < n ; i++ ) {
      with_node = _extend(with_node, with_node_pipe[i](node) || {});
      if( with_node.initNode ) {
        init_pipe.push(with_node.initNode);
        delete with_node.initNode;
      }
    }

    if( init_pipe.length ) {
      with_node.initNode = function () {
        for( var i = 0, n = init_pipe.length; i < n ; i++ ) {
          // init_pipe[i].call(node_el, node_el, node, with_node);
          init_pipe[i].apply(this, arguments);
        }
      };
    }

    return with_node;
  };

  renderNodes(parent, nodes, options);

  return parent.children;
};

App.prototype.withNode = function (withNode) {
  this.with_node_pipe.push(withNode);

  return this;
};

App.prototype.component = function (tag_name, initNode) {
  if( this.components[tag_name] ) throw new Error('Attempting to define component twice: ' + tag_name);

  this.components[tag_name] = initNode;

  this.with_node_pipe.push(function (node) {
    if( node.$ === tag_name ) return { initNode: initNode };
  });

  return this;
};

App.prototype.directive = function (directive, initNode) {

  if( directive instanceof RegExp ) directive = directive.source;
  directive = '^' + directive.replace(/^\^|\$$/, '') + '$';

  if( this.directives[directive] ) throw new Error('Attempting to define directive twice: ' + directive);

  this.directives[directive] = initNode;

  var matchRE = new RegExp(directive),
      matchAttr = function (attr) {
        return matchRE.test(attr);
      };

  this.with_node_pipe.push(function (node) {
    var attr = node.attrs && _find( Object.keys(node.attrs), matchAttr);

    if( attr ) return {
      withNode: function (node_el, node_options, with_node) {
        initNode.call(this, node_el, attr, node_options, with_node);
      },
    };
  });

  return this;
};
