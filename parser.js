
function _parseTag (tag_str) {
  // var tag = { attrs: {} };
  var tag = {};

  return tag_str
    .replace(/^<|>$/g, '')
    .replace(/\/$/, function () {
      tag.self_closed = true;
      return '';
    })
    .replace(/^\//, function () {
      if( tag.self_closed ) throw new Error('tag closer self_closed: ' + tag_str );
      tag.closer = true;
      return '';
    })
    .trim()
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

function parseHTML (html) {
  // removing comments
  html = html.replace(/<!--([\s\S]+?)-->/g, '');

  var contents = html.split(/<[^>]+?>/g);
  // var tags = html.match(/<([^>]+?)>/g);
  var nodes = [],
      node_opened = { $: '__root__', _: nodes };

  var tags = html.match(/<([^>]+?)>/g).map(function (tag, i) {

    if( /^\s+$/.test(contents[i]) ) contents[i] = '';

    if( i && contents[i] ) node_opened._.push({
      text: contents[i],
    });

    tag = _parseTag(tag);

    if( tag.closer ) {
      if( tag.$ !== node_opened.$ ) throw new Error('tag closer \'' + tag.$ + '\' for \'' + node_opened.$ + '\'' );
      node_opened = node_opened._parent;
    } else if( tag.self_closed ) {
      node_opened._.push(tag);
    } else {
      tag._parent = node_opened;
      tag._ = [];
      node_opened._.push(tag);
      node_opened = tag;
    }

    return tag;

  });

  // cleaning and avoiding circular structure
  tags.forEach(function (tag) {
    delete tag._parent;
    if( tag._ && !tag._.length ) delete tag._;
  });

  if( contents[contents.length - 1] && !/^\s+$/.test(contents[contents.length - 1]) ) nodes.push({
    text: contents[contents.length - 1],
  });

  // return {
  //   tags: tags,
  //   contents: contents,
  // };

  return nodes;
}

module.exports = parseHTML;
