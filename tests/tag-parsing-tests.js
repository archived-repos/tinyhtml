
var tinyHTML = require('../tinyhtml'),
    assert = require('assert');

var snippet_script = `foo<script src="http://example.com/script.js">
    var hola = function caracola () {};
  </script>bar`;

describe('parsing tags', function () {

  it('script', function () {

    assert.strictEqual( tinyHTML(snippet_script, {
      parsers: {
        script: function (tag) {
          return '';
        }
      }
    }), 'foo<script src="http://example.com/script.js"></script>bar', 'compress');

  });

  it('script attrs_str', function () {

    assert.strictEqual( tinyHTML(snippet_script, {
      parsers: {
        script: function (tag) {
          return tag.attrs_str;
        }
      }
    }), 'foo<script src="http://example.com/script.js">src="http://example.com/script.js"</script>bar', 'compress');

  });

  it('script attrs', function () {

    assert.strictEqual( tinyHTML(snippet_script, {
      parsers: {
        script: function (tag) {
          return 'var href = \'' + tag.attrs.src + '\';';
        }
      }
    }), `foo<script src="http://example.com/script.js">var href = 'http://example.com/script.js';</script>bar`, 'accesing attributes');

  });

});
