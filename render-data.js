
var RenderApp = require('./render-app'),
    con_text = require('./con-text'),
    interpolateText = con_text.interpolate;

function _extend(dest, src) {
  for( var key in src ) dest[key] = src[key];
}

module.export = function createApp(options) {
  options = options || {};

  var add_directives = _extend({
        if: true,
        repeat: true,
        on: true,
      }, options.add_directives || {}),
      directive_ns = options.directive_ns || 'data',
      render_options = {},
      app = new RenderApp(render_options),
      scope = {},
      scope_listeners = [],
      watchScope = function (onData) {
        scope_listeners.push(onData);
        onData(scope);
      };

  app.withNode(function (node) {
    if( typeof node.text === 'string' ) return {
      initNode: function (el) {
        var renderText = interpolateText(node.text);

        watchScope(function (scope) {
          var text = renderText(scope);
          if( text !== el.textContent ) el.textContent = text;
        });
      }
    };
  });

  if( add_directives.if ) {
    app.directive(directive_ns + '-if', function (_node) {

      // @TODO stuff

    }, function (node, attr) {
      return {
        replace_by_comment: ' data-if: ' + attr
      };
    });
  }

  if( add_directives.repeat ) {
    app.directive(directive_ns + '-repeat', function (_node) {

      // @TODO stuff

    }, function (node, attr) {
      return {
        replace_by_comment: ' data-repeat: ' + attr,
      };
    });
  }

  app.updateScope = function (_scope) {
    if( _scope ) scope = _scope;
    scope_listeners.forEach(function (listener) {
      listener(scope);
    });
  };

  return app;
};
