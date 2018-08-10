
var renderNodes = require('./render');

module.export = RenderApp;

function _extend(dest, src) {
  for( var key in src ) dest[key] = src[key];
}

function _find(list, iteratee, this_arg) {
  for( var i = 0, n = list.length; i < n ; i++ ) {
    if( iteratee.call(this_arg, list[i]) ) return list[i];
  }
  return null;
}

function RenderApp (_options) {
  var options = Object.create(_options || {});

  options._with_node_pipe = [];

  this.options = options;
}

RenderApp.prototype.render = function (parent, nodes, options) {
  var app = this,
      render_options = Object.create( this.options ),
      with_node_pipe = app.with_node_pipe;

  parent = parent || document.createElement('div');

  render_options.withNode = function (node) {
    var with_node = {},
        init_pipe = [],
        i, n, result_with_node;

    for( i = 0, n = with_node_pipe.length ; i < n ; i++ ) {
      result_with_node = with_node_pipe[i](node);
      if( result_with_node ) {
        if( result_with_node.initNode ) {
          init_pipe.push(result_with_node.initNode);
          // delete result_with_node.initNode; // will be overriden if init_pipe.length
        }

        with_node = _extend( with_node, result_with_node );
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

RenderApp.prototype.withNode = function (withNode) {
  this.with_node_pipe.push(withNode);

  return this;
};

RenderApp.prototype.component = function (tag_name, initNode, with_node) {
  // Allowing multiple initNode
  // if( this.components[tag_name] ) throw new Error('Attempting to define component twice: ' + tag_name);
  //
  // this.components = this.components ||{};
  // this.components[tag_name] = initNode;

  this.with_node_pipe.push(function (node) {
    if( node.$ === tag_name ) return with_node ? _extend( with_node, { initNode: initNode }) : { initNode: initNode };
  });

  return this;
};

RenderApp.prototype.directive = function (directive, initNode, withNode) {

  if( directive instanceof RegExp ) directive = directive.source;
  directive = '^' + directive.replace(/^\^|\$$/, '') + '$';

  // Allowing multiple initNode
  // this.directives = this.directives ||{};
  // if( this.directives[directive] ) throw new Error('Attempting to define directive twice: ' + directive);
  //
  // this.directives[directive] = initNode;

  var matchRE = new RegExp(directive),
      matchAttr = function (attr) {
        return matchRE.test(attr);
      };

  this.with_node_pipe.push(function (node) {
    var attr = node.attrs && _find( Object.keys(node.attrs), matchAttr);

    if( attr ) return _extend( withNode && withNode(node, attr) || {}, {
      initNode: function (node_el, node_options, with_node) {
        initNode.call(this, node_el, attr, node_options, with_node);
      },
    });
  });

  return this;
};
