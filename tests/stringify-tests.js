/* global describe, it */

var parseHTML = require('../lib/parser'),
    stringifyNodes = require('../lib/stringify'),
    assert = require('assert');

describe('stringify', function () {

  it('div', function () {

    assert.deepEqual( stringifyNodes([{ $:'div', attrs: { id: 'foobar' }, _:[{ text: 'foo' }] }]), `
<div id="foobar">foo</div>
    `.trim() );

  });

  it('script', function () {

    assert.strictEqual( stringifyNodes([{ $:'script', attrs: { 'template:type': 'text/javascript' }, _:`
  var foo = 'bar';
` }]), `
<script template:type="text/javascript">
  var foo = 'bar';
</script>
    `.trim() );

  });

  it('html', function () {

    var snippet = `
<!DOCTYPE html>
<html>
  <head></head>
  <body></body>
</html>
    `;

    assert.strictEqual( stringifyNodes(parseHTML(snippet)), '<!DOCTYPE html><html><head></head><body></body></html>' );

  });

  it('code', function () {

    var snippet = `
<pre><code class="language-html">
<!DOCTYPE html>
<html>
  <head></head>
  <body></body>
</html>
</code></pre>
    `;

    assert.strictEqual( stringifyNodes(parseHTML(snippet)), snippet.trim() );

  });

});
