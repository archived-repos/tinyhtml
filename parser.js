
function _parseTag (tag_str) {
  // var tag = { attrs: {} };
  var tag = { _: [] };
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
      return '';
    })
    .replace(/([^=]+)="([\s\S]*?)"|([^=]+)='([\s\S]*?)'/g, function (_matched, attribute, value) {
      // tag.attrs[attribute.trim()] = value;
      tag[attribute.trim()] = value;
      return '';
    })
    .split(/ +/)
    .reduce(function (tag, empty_attr) {
      if( !empty_attr ) return tag;
      // tag.attrs[empty_attr.trim()] = '';
      tag[empty_attr.trim()] = '';
      return tag;
    }, tag)
  ;
}

function _trimText (text) {
  return text.replace(/ +\n+|\n+ +/g, '');
}

function _parseHTML (html, options) {
  options = options || {};
  // removing comments
  html = html.replace(/<!--([\s\S]+?)-->/g, '');

  var contents = html.split(/<[^>]+?>/g);
  // var tags = html.match(/<([^>]+?)>/g);
  var nodes = options.nodes || [],
      node_opened = options.node_opened || { $: '__root__', _: nodes };

  (html.match(/<([^>]+?)>/g) ||[]).map(function (tag, i) {

    // if( /^\s+$/.test(contents[i]) ) contents[i] = '';

    // if( i && contents[i] && !/^\s+$/.test(contents[i]) ) node_opened._.push({
    if( /\S/.test(contents[i]) ) node_opened._.push({
      text: _trimText(contents[i]),
    });

    tag = _parseTag(tag);

    if( tag.closer ) {
      if( tag.$ !== node_opened.$ ) throw new Error('tag closer \'' + tag.$ + '\' for \'' + node_opened.$ + '\'' );
      node_opened = node_opened._parent;
    } else if( tag.self_closed ) {
      node_opened._.push(tag);
    } else {
      tag._parent = node_opened;
      // tag._ = [];
      node_opened._.push(tag);
      node_opened = tag;
    }

    return tag;

  });

  if( /^\S$/.test(contents[contents.length - 1]) ) nodes.push({
    text: _trimText(contents[contents.length - 1]),
  });

  return {
    nodes: nodes,
    node_opened: node_opened,
  };
}

var full_content_tags = [
  'script',
  'style',
  'code',
];

var RE_full_content = new RegExp(full_content_tags.map(function (tag_name) {
  return '<' + tag_name + '[^>]*>|<\\/' + tag_name + '>';
}).join('|'), 'g');

// var RE_full_content = new RegExp('<(' + full_content_tags.join('|') + ')[^>]*>|<\\/(' + full_content_tags.join('|') + ')>', 'g');

function _cleanNodes (nodes) {
  nodes.forEach(function (tag) {
    // avoiding circular structure
    delete tag._parent;
    // cleaning empty children

    if( tag._ instanceof Array ) {
      if( !tag._.length ) delete tag._;
      else _cleanNodes(tag._);
    }
  });
  return nodes;
}

function parseHTML (html, _options) {
  var tags = html.match(RE_full_content) ||[],
      contents = html.split(RE_full_content),
      tag_opened = null,
      nodes = [],
      last_parse = {};

  tags.forEach(function (tag, i) {

    if( tag_opened ) tag_opened._ = contents[i];
    else (function (parse_result) {
      last_parse = parse_result;
    })( _parseHTML(contents[i], {
      nodes: nodes,
      node_opened: last_parse.node_opened,
    }) );

    tag = _parseTag(tag);

    if( tag.closer ) {
      if( !tag_opened || tag_opened.$ !== tag.$ ) throw new Error('tag closer \'' + tag.$ + '\' for \'' + (tag_opened ? tag_opened.$ : '!tag_opened') + '\'' );
      tag_opened = null;
    } else {
      tag_opened = tag;
      if( last_parse.node_opened ) {
        last_parse.node_opened._ = last_parse.node_opened._ || [];
        last_parse.node_opened._.push(tag);
      } else {
        nodes.push(tag);
      }
    }

  });

  _parseHTML(contents[contents.length - 1], {
    nodes: nodes,
    node_opened: last_parse.node_opened,
  });

  return _cleanNodes(nodes);
}

module.exports = parseHTML;
