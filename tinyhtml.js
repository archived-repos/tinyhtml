
function byCamelCase (_matched, a, b) {
  return a + b.toUpperCase();
}

function attr2CamelCase (attrName) {
  return attrName.replace(/([a-z])-([a-z])/g, byCamelCase);
}

function TagValues (attrs_str, body) {
  this.attrs_str = attrs_str;
  this.body = body;
}

Object.defineProperty(TagValues.prototype, 'attrs', {
  get: function () {
    if( !this.$$parsedAttributes ) this.$$parsedAttributes = this.attrs_str.match(/[a-z][a-z-]+(=".*?")?/g).reduce(function (attrs, attr) {
      attr.replace(/([a-z][a-z-]+)(="(.*?)")?/, function (matched, name, hasValue, value) {
        attrs[attr2CamelCase(name)] = hasValue ? value : '';
      });
      return attrs;
    }, {});

    return this.$$parsedAttributes;
  }
});

var tagReplacer = {};
function replaceTag (tagName, html, cb) {
  if( !tagReplacer[tagName] ) tagReplacer[tagName] = new RegExp('<' + tagName + ' (.*?)>(.*?)</' + tagName + '>', 'g');
  return html.replace(tagReplacer[tagName], function (_matched, attrs, body) {
    var node = new TagValues(attrs, body),
        result = cb(node);

    return '<' + tagName + ' ' + node.attrs_str + '>' + result + '</' + tagName + '>';
  });
}

function sanitizedAttribute (_matched, name, value, followsSpaces) {
  return name + '="' + value + '"' + (followsSpaces ? ' ' : '');
}

function cleanTag (_matched, tag) {
  return tag.replace(/([a-z][a-z-]+)="\s*(.*?)\s*"(\s+)?/g, sanitizedAttribute);
}

function tinyHTML (html, options) {
  options = options || {};

  var result = html.replace(/\n/g, '').replace(/\t+/g, ' ').replace(/\s*(<.*?>)\s*/g, cleanTag);

  if( options.removeComments || options.removeComments === undefined ) {
    result = result.replace(/<!--[\s\S]+(?=-->)-->/g, '');
  }

  if( options.parsers ) for( var tag in options.parsers ) {
    result = replaceTag(tag, result, options.parsers[tag] );
  }

  return result;
};

module.exports = tinyHTML;
