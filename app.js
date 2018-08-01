
import _ from 'jqnano';
import renderNodes from 'tinyhtml/render';

var TEXT = require('./text');

var init_tags = {};

function _renderNodes (parent, nodes, options) {
  var scope_listeners = [];

  options = options || {};

  var scope = options.scope || {};

  renderNodes(parent, nodes, {
    init: init_tags,
    insert_before: options.insert_before,
    skip_preprocess: options.skip_preprocess,
    preprocessNode: function (node) {
      if( node.attrs && node.attrs['data-repeat'] ) return {
        render_comment: ' end data-repeat: ' + node.attrs['data-repeat'].trim() + ' ',
      };
    },
    initNode: function (el, node) {
      if( node.text ) {
        if( /{{.*?}}/.test(node.text) ) (function (renderText)  {
          function onData (scope) {
            var text = renderText(scope);
            if( text !== el.textContent ) el.textContent = text;
          }
          scope_listeners.push(onData);
          onData(scope);
        })( TEXT.interpolate(node.text) );
      } else if( node.attrs ) {
        // console.log('node.attrs', node);

        if( node.attrs['data-class'] ) (function ( getClassNames ) {
          function onData (scope) {
            var classNames = getClassNames(scope);
            for( var key in classNames ) {
              if( classNames[key] ) _.addClass(el, key);
              else _.removeClass(el, key);
            }
          }
          scope_listeners.push(onData);
          onData(scope);
        })( TEXT.eval(node.attrs['data-class']) );

        if( node.attrs['data-if'] ) (function (parent_el, comment_el, assertExpression) {
          parent_el.replaceChild(comment_el, el);
          function onData (scope) {
            if( assertExpression(scope) ) parent_el.insertBefore(el, comment_el);
            else if( parent_el.contains(el) ) parent_el.removeChild(el);
          }
          scope_listeners.push(onData);
          onData(scope);
        })( el.parentElement, document.createComment(' data-if: ' + node.attrs['data-if'] + ' ' ), TEXT.eval(node.attrs['data-if']) );

        if( node.attrs['data-repeat'] && !options._skip_repeat ) (function (parent_el, comment_start, matched_expressions) {
          if( !matched_expressions ) throw new Error('data-repeat invalid expression: ' + node.attrs['data-repeat'] );

          var list_key = matched_expressions[1].trim(),
              getList = TEXT.eval(matched_expressions[2]),
              comment_end = el;

          // parent_el.replaceChild(comment_end, el);
          parent_el.insertBefore(comment_start, comment_end);

          function onData (scope) {
            var list = getList(scope),
                aux_el = document.createElement('div'),
                remove_el = comment_start.nextSibling;

            while( remove_el !== comment_end ) {
              parent_el.removeChild(remove_el);
              remove_el = comment_start.nextSibling;
            }

            if( !(list instanceof Array) ) throw new Error('expression \'' + matched_expressions[2] + '\' should return an Array');

            list.forEach(function (data_item) {
              var _scope = Object.create(scope),
                  _options = Object.create(options);

              _scope[list_key] = data_item;

              _options.insert_before = comment_end;
              _options._skip_repeat = true;
              _options.skip_preprocess = true;
              _options.scope = _scope;

              _renderNodes(parent_el, [node], _options);
            });
          }
          scope_listeners.push(onData);
          onData(scope);
        })(
          el.parentElement,
          document.createComment(' start data-repeat: ' + node.attrs['data-repeat'] + ' ' ),
          node.attrs['data-repeat'].match(/(\w+?) in (.+)/)
        );
      }

      for( var key in node.attrs ) {

        if( /^data-on:\w+/.test(key) ) (function (event_name, eventFn) {

          el.addEventListener(event_name, function () {
            eventFn(scope);
          });

        })( key.substr(8), new Function('scope', 'with(scope){' + node.attrs[key] + '}' ) );
      }
    },
  });

  return {
    parent: parent,
    nodes: nodes,
    updateScope: function (_scope) {
      if( _scope ) scope = _scope;
      scope_listeners.forEach(function (listener) {
        listener(scope);
      });
    },
  };
}

module.exports = {
  render: _renderNodes,
  component: function (tag_name, options) {
    options = options || {};
    init_tags[tag_name] = function () {
      // console.log('tag %c' + tag_name, 'color: blue; font-weight: bold', options);

      if( typeof options.template === 'string' ) {
        this.innerHTML = options.template;
        if( options.controller instanceof Function ) setTimeout( options.controller.bind(this) );
        return;
      }

      if( options.template ) _renderNodes(this, options.template, {
        init: init_tags,
      });

      if( options.controller instanceof Function ) options.controller.call(this, this);
    };
  }
};
