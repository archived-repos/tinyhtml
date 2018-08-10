
function textContext () {
  var filter_definitions = {};

  function defineFilter (name, filterFn) {
    filter_definitions[name] = filterFn;
  }

  function processFilter (name, input) {
    if( !filter_definitions[name] ) throw new Error('filter ' + name + 'is not defined');

    return filter_definitions[name](input);
  }

  function _evalExpression (expression) {
    try {
      return new Function('scope', 'try { with(scope) { return (' + expression + '); }; } catch(err) { return \'\'; }');
    } catch(err) {
      console.error(err.message, err); // eslint-disable-line
    }
  }

  function evalExpression (expression) {
    var filters_list = expression.split('|'),
        getValue = _evalExpression( filters_list.shift() );

    if( !filters_list.length ) return getValue;

    return function (scope) {
      var result = getValue(scope),
          filters = filters_list.slice(),
          filter_name = filters.shift();

      while( filter_name ) {
        result = processFilter( filter_name.trim(), result );
        filter_name = filters.shift();
      }

      return result;
    };
  }

  function interpolateText (text) {
    var texts = text.split(/{{.*?}}/),
        expressions = text.match(/{{.*?}}/g).map(function (expression) {
          return evalExpression( expression.replace(/^{{|}}$/g, '') );
        });

    return function (scope) {
      return texts.reduce(function (result, text, i) {
        return result + text + ( expressions[i] ? expressions[i](scope) : '' );
      }, '');
    };
  }

  return {
    interpolate: interpolateText,
    eval: evalExpression,
    defineFilter: defineFilter,
    processFilter: processFilter,
  };
}

var context = textContext();

context.createContext = textContext;

module.exports = context;
