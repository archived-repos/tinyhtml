
var _ = require('./utils'),
    renderNodes = require('./render');

module.exports = RenderApp;

function RenderApp (_options) {
  var options = Object.create(_options || {});

  this.with_node_pipe = [];

  this.options = options;
}

RenderApp.prototype.render = function (parent, nodes, _options) {
  var app = this,
      render_options = _.extend( Object.create( this.options ), _options || {} ),
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
          if( typeof result_with_node.initNode !== 'function' ) throw new Error('initNode should be a function\n\n' + result_with_node.initNode );
          init_pipe.push(result_with_node.initNode);
          // delete result_with_node.initNode; // will be overriden if init_pipe.length
        }

        with_node = _.extend( with_node, result_with_node );
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

  renderNodes(parent, nodes, render_options);

  return parent.children;
};

RenderApp.prototype.withNode = function (withNode) {
  this.with_node_pipe.push(withNode);

  return this;
};

RenderApp.prototype.component = function (tag_name, options) {
  // Allowing multiple initNode
  // if( this.components[tag_name] ) throw new Error('Attempting to define component twice: ' + tag_name);
  //
  // this.components = this.components ||{};
  // this.components[tag_name] = initNode;

  options = options || {};

  this.with_node_pipe.push(function (node) {

    if( node.$ === tag_name ) _.extend( options.withNode && options.withNode(node) || {}, {
      initNode: options.controller && options.template ? function (node_el) {
        var _this = this, _args = arguments;

        node_el.innerHTML = options.template;

        setTimeout(function () {
          options.controller.apply(_this, _args);
        });
      } : ( options.controller || function (node_el) {
        node_el.innerHTML = options.template;
      }),
    });

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
    var attr_value = node.attrs && _.find( Object.keys(node.attrs), matchAttr);

    if( attr_value ) return _.extend( withNode && withNode(node, attr_value) || {}, {
      initNode: function (node_el, node, with_node, render_options) {
        initNode.apply({
          el: node_el,
          node: node,
          with_node: with_node,
          attr_value: attr_value,
          render_options: render_options,
        }, arguments);
      },
    });
  });

  return this;
};
