
// import { getOptions } from 'loader-utils';

import tinyHTML from './tinyhtml';

function _stringify (o) {
  if( o instanceof Array ) {
    return '[' + o.map(function (_o) {
      return _stringify(_o);
    }).join(',') + ']';
  } else if( typeof o === 'object' && o !== null ) {
    return '{' + Object.keys(o).map(function (key) {
      return key + ': ' + _stringify(o[key]);
    }).join(',') + '}'
  } else if( o instanceof Function ) {
    return o.toString();
  } else return o;
}


function _extractScripts (nodes, parent) {

  for( var i = nodes.length - 1 ; i >= 0 ; i-- ) {
    if( parent && nodes[i].$ === 'script' ) {
      parent._init = parent._init || [];
      parent._init.push( new Function( nodes[i]._ ) );
      nodes.splice(i, 1);
    } else if( nodes[i]._ instanceof Array ) {
      _extractScripts( nodes[i]._, nodes[i] );
    }
  }


}

function processHTML (html) {
  return _stringify( _extractScripts(tinyHTML.parse(html)) );
}

function webpackLoader (source) {
  // const options = getOptions(this);

  // Apply some transformations to the source...

  return `export default ${ JSON.stringify(tinyHTML(source)) }`;
}

webpackLoader.processHTML = processHTML;

export default webpackLoader;