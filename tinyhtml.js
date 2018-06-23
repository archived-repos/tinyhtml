
var parseHTML = require('./parser'),
    stringifyNodes = require('./stringify');

function tinyhtml (html, options) {
  return stringifyNodes( parseHTML(html, options), options );
}

tinyhtml.parse = parseHTML;
tinyhtml.stringify = stringifyNodes;

module.exports = tinyhtml;

// (function (root, factory) {
//   if (typeof module === 'object' && module.exports) module.exports = factory();
//   else if (typeof define === 'function' && define.amd) define([], factory);
//   else root.tinyHTML = factory();
// })(this, function () {
//
//   function byCamelCase (_matched, a, b) {
//     return a + b.toUpperCase();
//   }
//
//   function attr2CamelCase (attrName) {
//     return attrName.replace(/([a-z])-([a-z])/g, byCamelCase);
//   }
//
//   function TagValues (attrs_str, body) {
//     this.attrs_str = attrs_str;
//     this.body = body;
//   }
//
//   Object.defineProperty(TagValues.prototype, 'attrs', {
//     get: function () {
//       if( !this.$$parsedAttributes ) this.$$parsedAttributes = this.attrs_str.match(/[a-z][a-z-]+(=".*?")?/g).reduce(function (attrs, attr) {
//         attr.replace(/([a-z][a-z-]+)(="(.*?)")?/, function (matched, name, hasValue, value) {
//           attrs[attr2CamelCase(name)] = hasValue ? value : '';
//         });
//         return attrs;
//       }, {});
//
//       return this.$$parsedAttributes;
//     }
//   });
//
//   var tagReplacer = {};
//   function replaceTag (tagName, html, cb) {
//     if( !tagReplacer[tagName] ) tagReplacer[tagName] = new RegExp('<' + tagName + ' (.*?)>(.*?)</' + tagName + '>', 'g');
//     return html.replace(tagReplacer[tagName], function (_matched, attrs, body) {
//       var node = new TagValues(attrs, body),
//           result = cb(node);
//
//       return '<' + tagName + ' ' + node.attrs_str + '>' + result + '</' + tagName + '>';
//     });
//   }
//
//   function sanitizedAttribute (_matched, name, value, followsSpaces) {
//     if( name === 'style' ) value = value.replace(/([:;])\s+/g, '$1');
//     return name + '="' + value + '"' + (followsSpaces ? ' ' : '');
//   }
//
//   function cleanTag (_matched, tag) {
//     return tag.replace(/([a-z][a-z-]+)="\s*(.*?)\s*"(\s+)?/g, sanitizedAttribute);
//   }
//
//   function tinyHTML (html, options) {
//     options = options || {};
//
//     var result = html.replace(/\n/g, '').replace(/\t+/g, ' ');
//
//     if( options.removeDoubleSpaces || options.removeDoubleSpaces === undefined ) {
//       result = result.replace(/\s+/g, ' ');
//     }
//
//     if( options.removeComments || options.removeComments === undefined ) {
//       result = result.replace(/<!--[\s\S]+?-->/g, '');
//     }
//
//     if( options.processors ) for( var tag in options.processors ) {
//       result = replaceTag(tag, result, options.processors[tag] );
//     }
//
//     result = result.replace(/\s*(<.*?>)\s*/g,
//       options.removeAttributeSpaces || options.removeAttributeSpaces === undefined ? cleanTag : '$1'
//     );
//
//     return result;
//   }
//
//   return tinyHTML;
// });
