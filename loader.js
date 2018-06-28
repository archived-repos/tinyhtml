
// import { getOptions } from 'loader-utils';

var tinyHTML = require('./tinyhtml'),
    _isNotNull = function (o) { return o !== null; };

function _stringify (o, options) {
  if( o instanceof Array ) {

    return '[' + o.map(function (_o) {
      return _stringify(_o, options);
    }).filter(_isNotNull).join(',') + ']';

  } else if( typeof o === 'object' && o !== null ) {

    if( options.remove_comments !== false && o.comments ) return null;

    return '{' + Object.keys(o).map(function (key) {
      return ( /^[a-zA-Z_$]+$/.test(key) ? key : ( '\'' + key + '\'' ) ) + ':' + _stringify(o[key], options);
    }).join(',') + '}';

  } else if( o instanceof Function ) {

    return o.toString();

  } else if( typeof o === 'string' ) return '\'' + o.replace(/\n+/g, '\\n').replace(/'/g, '\\\'') + '\'';
  else return o;
}


function _extractScripts (nodes, parent, options) {
  // console.log('_extractScripts', options );

  for( var i = nodes.length - 1 ; i >= 0 ; i-- ) {
    if( parent && nodes[i].$ === 'script' ) {
      parent._init = parent._init || [];
      // console.log('_init', options.processScript ? options.processScript(nodes[i]) : nodes[i]._ );
      parent._init.push( new Function( options.processScript ? options.processScript(nodes[i]) : nodes[i]._ ) );
      nodes.splice(i, 1);
    } else if( nodes[i]._ instanceof Array ) {
      _extractScripts( nodes[i]._, nodes[i], options );
    }
  }

  return nodes;
}

function html2js (html, options) {
  options = options || {};
  if( options.extract_scripts !== false ) return _stringify( _extractScripts(tinyHTML.parse(html), null, options), options );
  return _stringify( tinyHTML.parse(html), options );
}

function loader (html, options) {
  options = options || {};
  // const options = getOptions(this);

  // Apply some transformations to the source...

  // var result = 'module.exports = ' + html2js(html, options);
  //
  // console.log('\nhtml loader\n', result);
  //
  // return result;
  return (options.cjs ? 'module.exports = ' : 'export default ') + html2js(html, options) + ';';
}

loader.html2js = html2js;

// export default loader;
module.exports = loader;
