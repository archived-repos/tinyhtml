
function createEnv () {

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
      console.error(err.message, err);
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
    defineFilter: defineFilter,
    processFilter: processFilter,
    eval: evalExpression,
    interpolate: interpolateText,
  };
}

var TEXT = createEnv();

TEXT.createEnv = createEnv;

module.exports = TEXT;
