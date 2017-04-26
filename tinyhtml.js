
var tagReplacer = {};

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

function replaceTag (tag, html, cb) {
  if( !tagReplacer[tag] ) tagReplacer[tag] = new RegExp('<' + tag + ' (.*?)>(.*?)</' + tag + '>', 'g');
  return html.replace(tagReplacer[tag], function (_matched, attrs, body) {
    return cb(new TagValues(attrs, body));
  });
}

function tinyHTML (html, options) {
  options = options || {};

  var result = html.replace(/\n/g, '')
    .replace(/([a-z][a-z-]+)="\s+(.*?)"/g, '$1="$2"')
    .replace(/([a-z][a-z-]+)="(.*?)\s+"/g, '$1="$2"')
    .replace(/([a-z][a-z-]+=".*?")\s+/g, '$1 ')
    .replace(/<(.*?)>\s+/g, '<$1>')
    .replace(/\s+<(.*?)>/g, '<$1>');

  if( options.removeComments || options.removeComments === undefined ) {
    result = result.replace(/<!--[\s\S]+(?=-->)-->/g, '');
  }

  if( options.parsers ) for( var tag in options.parsers ) {
    result = replaceTag(tag, result, options.parsers[tag] );
  }

  return result;
};

module.exports = tinyHTML;
