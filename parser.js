
function _parseTag (tag_str, _options) {
  var tag = { attrs: {}, _: [], unclosed: true };
  // var tag = { _: [] };
      // tag = Object.create(tag_proto);

  return tag_str
    .replace(/^<|>$/g, '')
    .replace(/ *\/$/, function () {
      tag.self_closed = true;
      return '';
    })
    .replace(/^\//, function () {
      if( tag.self_closed ) throw new Error('tag closer self_closed: ' + tag_str );
      tag.closer = true;
      return '';
    })
    .replace(/^[^ ]+/, function (node_name) {
      tag.$ = node_name;
      if( /^!/.test(node_name) ) tag.warn = true;
      return '';
    })
    .replace(/ *([^=]+) *= *"([\s\S]*?)"| *([^=]+) *= *'([\s\S]*?)'/g, function (_matched, attribute, value) {
      attribute = attribute.trim();
      // if( attribute === 'style' ) value = value.replace(/([:;])\s+/g, '$1');
      // if( _options.compress_attibutes !== false ) value = value.replace(/ *\n */g, '').trim();
      tag.attrs[attribute] = value;
      // tag[attribute.trim()] = value;
      return '';
    })
    .split(/ +/)
    .reduce(function (tag, empty_attr) {
      if( !empty_attr ) return tag;
      tag.attrs[empty_attr.trim()] = '';
      // tag[empty_attr.trim()] = '';
      return tag;
    }, tag)
  ;
}

function _trimText (text) {
  // return text.replace(/^ *\n+ *| *\n+ *$/g, '');
  return text.replace(/ *\n+ */g, '');
}

// function _parseHTML (html, options) {
//   options = options || {};
//
//   // removing comments
//   if( options.remove_comments !== false ) html = html.replace(/<!--([\s\S]+?)-->/g, '');
//
//   var contents = html.split(/<[^>]+?>/g);
//   // var tags = html.match(/<([^>]+?)>/g);
//   var nodes = options.nodes || [],
//       node_opened = options.node_opened || { $: '__root__', _: nodes };
//
//   (html.match(/<([^>]+?)>/g) ||[]).map(function (tag, i) {
//
//     // if( /^\s+$/.test(contents[i]) ) contents[i] = '';
//
//     // if( i && contents[i] && !/^\s+$/.test(contents[i]) ) node_opened._.push({
//     if( /\S/.test(contents[i]) ) node_opened._.push({
//       text: _trimText(contents[i]),
//     });
//
//     tag = _parseTag(tag, options);
//
//     if( tag.closer ) {
//       if( tag.$ !== node_opened.$ ) throw new Error('tag closer \'' + tag.$ + '\' for \'' + node_opened.$ + '\'' );
//       delete node_opened.unclosed;
//       node_opened = node_opened._parent;
//     } else if( tag.self_closed ) {
//       node_opened._.push(tag);
//     } else {
//       tag._parent = node_opened;
//       // tag._ = [];
//       node_opened._.push(tag);
//       node_opened = tag;
//     }
//
//     return tag;
//
//   });
//
//   if( /\S$/.test(contents[contents.length - 1]) ) nodes.push({
//     text: _trimText(contents[contents.length - 1]),
//   });
//
//   return {
//     nodes: nodes,
//     node_opened: node_opened,
//   };
// }
//
// var full_content_tags = [
//   'script',
//   'style',
//   'code',
// ];
//
// var RE_full_content = new RegExp( full_content_tags.map(function (tag_name) {
//   return '<' + tag_name + '[^>]*>|<\\/' + tag_name + '>';
// }).join('|'), 'g');
//
// // var RE_full_content = new RegExp('<(' + full_content_tags.join('|') + ')[^>]*>|<\\/(' + full_content_tags.join('|') + ')>', 'g');
//
// function _cleanNodes (nodes) {
//   nodes.forEach(function (tag) {
//     // avoiding circular structure
//     delete tag._parent;
//
//     // cleaning empty attributes
//     if( tag.attrs && Object.keys(tag.attrs).length === 0 ) delete tag.attrs;
//
//     // cleaning empty children
//     if( tag._ instanceof Array ) {
//       if( !tag._.length ) delete tag._;
//       else _cleanNodes(tag._);
//     }
//
//   });
//   return nodes;
// }
//
// // @TODO: parse comments first of all
//
// function parseHTML (html, options) {
//   var tags = html.match(RE_full_content) ||[],
//       contents = html.split(RE_full_content),
//       tag_opened = null,
//       nodes = [],
//       last_parse = {};
//
//   options = options || {};
//
//   tags.forEach(function (tag, i) {
//
//     if( tag_opened ) tag_opened._ = contents[i];
//     else last_parse = _parseHTML(contents[i], {
//       nodes: nodes,
//       node_opened: last_parse.node_opened,
//       remove_comments: options.remove_comments,
//       compress_attibutes: options.compress_attibutes
//     });
//
//     tag = _parseTag(tag, options);
//
//     if( tag.closer ) {
//       if( !tag_opened || tag_opened.$ !== tag.$ ) throw new Error('tag closer \'' + tag.$ + '\' for \'' + (tag_opened ? tag_opened.$ : '!tag_opened') + '\'' );
//       delete tag_opened.unclosed;
//       tag_opened = null;
//     } else {
//       tag_opened = tag;
//       (last_parse.node_opened ? last_parse.node_opened._ : nodes).push(tag);
//     }
//
//   });
//
//   last_parse = _parseHTML(contents[contents.length - 1], {
//     nodes: nodes,
//     node_opened: last_parse.node_opened,
//   });
//
//   if( !options.ignore_unclosed && last_parse.node_opened && last_parse.node_opened.unclosed && !last_parse.node_opened.warn ) {
//     throw new Error('tab unclosed \'' + last_parse.node_opened.$ + '\'');
//   }
//
//   return _cleanNodes(nodes);
// }

function _zipTokens (splitted, matched) {
  var list = [];
  for( var i = 0, n = matched.length ; i < n ; i++ ) {
    list.push( splitted[i] );
    list.push( matched[i] );
  }
  list.push( matched[i] );
  return list;
}

function _tokenize (text, RE_split, RE_match, mapTokens) {
  return _zipTokens( text.split(RE_split), mapTokens ? text.match(RE_match).map(mapTokens) : text.match(RE_match) );
}

var full_content_tags = [
  'script',
  'style',
  'code',
];

var RE_full_content = new RegExp( full_content_tags.map(function (tag_name) {
  return '<' + tag_name + '[^>]*>|<\\/' + tag_name + '>';
}).join('|'), 'g');

function _parseHTML (html, options) {
  var tokens = _tokenize(html, RE_full_content, RE_full_content, _parseTag ), i, n;

  for( i = 0, n = tokens.length; i < n ; i++ ) {
    if( typeof tokens[i] === 'string' ) tokens[i] = _tokenize(tokens[i])
  }
}


module.exports = function (html, options) {
  options = options || {};
  return _parseHTML(html, options);
};
