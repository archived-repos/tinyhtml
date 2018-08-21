
module.exports = function textContext (context) {
  var filter_definitions = {};

  context = context || {};

  function defineFilter (name, filterFn) {
    filter_definitions[name] = filterFn;
  }

  function processFilter (name, input, scope) {
    if( !filter_definitions[name] ) throw new Error('filter \'' + name + '\' is not defined');

    return filter_definitions[name](input, scope);
  }

  function _evalExpression (expression) {
    return new Function('scope', 'try { with(scope) { return (' + expression + '); }; } catch(err) { return \'\'; }');
    // try {
    // } catch (err) {
    //   console.error(err.message, err); // eslint-disable-line
    // }
  }

  function evalFilter (filter_key) {
    filter_key = filter_key.trim();

    if( !/:/.test(filter_key) ) {
      return function (input) {
        return processFilter( filter_key, input );
      };
    }

    filter_key = filter_key.split(/:(.+)/);
    return (function (filter_name, getData ) {
      return function (input, scope) {
        return processFilter( filter_name, input, getData(scope || {}) );
      };
    })( filter_key[0], _evalExpression(filter_key[1]) );
  }

  function evalFilters (filters_list) {
    var filters_funcs = filters_list.map(evalFilter);

    if( !filters_list.length ) return function (result) { return result; };

    return function (result, scope) {
      scope = scope || {};
      for( var i = 0, n = filters_funcs.length ; i < n ; i++ ) {
        result = filters_funcs[i](result, scope);
      }

      return result;
    };
  }

  function evalExpression (expression) {
    if( typeof expression !== 'string' ) throw new TypeError('expression should be a String');

    var filters_list = expression.split('|'),
        getValue = _evalExpression( filters_list.shift() ),
        processFilters = evalFilters(filters_list);

    if( !filters_list.length ) return getValue;

    return function (scope, filters_scope) {
      scope = scope || {};
      return processFilters( getValue(scope), filters_scope || scope );
    };
  }

  function interpolateText (text) {
    var texts = text.split(/{{.*?}}/),
        expressions = ( text.match(/{{.*?}}/g) ||[] ).map(function (expression) {
          return evalExpression( expression.replace(/^{{|}}$/g, '') );
        });

    return function (scope) {
      return texts.reduce(function (result, text, i) {
        return result + text + ( expressions[i] ? expressions[i](scope) : '' );
      }, '');
    };
  }

  context.interpolate = interpolateText;
  context.eval = evalExpression;
  context.defineFilter = defineFilter;
  context.processFilter = processFilter;

  context.evalFilter = evalFilter;
  context.evalFilters = evalFilters;

  return context;
};
