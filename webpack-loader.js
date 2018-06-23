
// import { getOptions } from 'loader-utils';

import tinyHTML from './tinyhtml';

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
  var nodes = tinyHTML.parse(html);

  _extractScripts(nodes);

  return nodes;
}

function webpackLoader (source) {
  // const options = getOptions(this);

  // Apply some transformations to the source...

  return `export default ${ JSON.stringify(tinyHTML(source)) }`;
}

webpackLoader.processHTML = processHTML;

export default webpackLoader;
