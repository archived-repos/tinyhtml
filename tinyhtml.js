
function TagValues (attrs, body) {
  this.attrs = attrs;
  this.body = body;
}

TagValues.prototype.parsedAttributes = function () {
  if( !this.$$parsedAttributes ) this.$$parsedAttributes = this.attrs.match(/[a-z][a-z-]+(=".*?")?/g).reduce(function (attrs, attr) {
    attr.replace(/([a-z][a-z-]+)(="(.*?)")?/, function (matched, name, hasValue, value) {
      attrs[name] = hasValue ? value : '';
    });
    return attrs;
  }, {})
};

var tagReplacer = {};
function replaceTag (tagName, html, cb) {
  if( !tagReplacer[tagName] ) tagReplacer[tagName] = new RegExp('<' + tagName + ' (.*?)>(.*?)</' + tagName + '>', 'g');
  return html.replace(tagReplacer[tagName], function (_matched, attrs, body) {
    var node = new TagValues(attrs, body),
        result = cb(node);

    return '<' + tagName + ' ' + node.attrs + '>' + result + '</' + tagName + '>';
  });
}

function sanitizedAttribute (_matched, name, value, followsSpace) {
  return name + '="' + value + '"' + (followsSpace ? ' ' : '');
}

function cleanTag (_matched, tag) {
  return tag.replace(/([a-z][a-z-]+)="\s*(.*?)\s*"(\s+)?/g, sanitizedAttribute);
}

function tinyHTML (html, options) {
  options = options || {};

  var result = html.replace(/\n/g, '').replace(/\s*(<.*?>)\s*/g, cleanTag);

  if( options.removeComments || options.removeComments === undefined ) {
    result = result.replace(/<!--[\s\S]+(?=-->)-->/g, '');
  }

  if( options.parsers ) for( var tag in options.parsers ) {
    result = replaceTag(tag, result, options.parsers[tag] );
  }

  return result;
};

module.exports = tinyHTML;
