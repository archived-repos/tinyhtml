/* global describe, it */

var parseHTML = require('../parser'),
    assert = require('assert');

describe('parser', function () {

  it('div', function () {

    assert.deepEqual( parseHTML(`
<div id="foobar">foo</div>
    `), [{ $:'div', attrs:{ id: 'foobar' }, _:[{ text: 'foo' }] }] );

  });

  it('attrs in lines', function () {

    assert.deepEqual( parseHTML(`
<div id="foobar"
     foo="bar">foo</div>
    `), [{ $:'div', attrs:{ id: 'foobar', foo: 'bar' }, _:[{ text: 'foo' }] }] );

  });

  it('throws', function () {

    assert.throws( () => parseHTML('<div id="foobar">'), Error );

  });

  it('comments', function () {

    assert.deepEqual( parseHTML(`
<div id="foobar"
     foo="bar">foo</div>
<!--<div id="barfoo"
    bar="foo">bar</div>-->    `), [{ $:'div', attrs:{ id: 'foobar', foo: 'bar' }, _:[{ text: 'foo' }] }] );

  });

  it('script', function () {

    assert.deepEqual( parseHTML(`
<script template:type="text/javascript">
  var foo = 'bar';
</script>
    `), [{ $:'script', attrs: { 'template:type': 'text/javascript' }, _:`
  var foo = 'bar';
` }] );

  });

  it('div script', function () {

    assert.deepEqual( parseHTML(`
<div class="script-wrapper">
<script template:type="text/javascript">
  var foo = 'bar';
</script>
</div>
    `), [{
  $: 'div',
  attrs: { class: 'script-wrapper' },
  _: [{ $:'script', attrs: { 'template:type': 'text/javascript' }, _:`
var foo = 'bar';
` }]
}] );

  });

  it('script comments (in)', function () {

    assert.deepEqual( parseHTML(`
<script template:type="text/html">
  <div></div>
  <!-- <div></div> -->
</script>
    `), [{ $:'script', attrs: { 'template:type': 'text/html' }, _:`
  <div></div>
  <!-- <div></div> -->
` }] );

  });

  it('script comments (out)', function () {

    assert.deepEqual( parseHTML(`
<!--<script template:type="text/javascript">
  var foo = 'bar';
</script>-->
<script template:type="text/javascript">
  var bar = 'foo';
</script>
    `), [{ $:'script', attrs: { 'template:type': 'text/javascript' }, _:`
  var bar = 'foo';
` }] );

  });

  it('code', function () {

    assert.deepEqual( parseHTML(`
<pre><code class="language-html">
<!DOCTYPE html>
<html>
  <head></head>
  <body></body>
<html>
</code></pre>
    `), [{ $:'pre', _: [{
      $: 'code', attrs: { class: 'language-html' }, _: `
<!DOCTYPE html>
<html>
  <head></head>
  <body></body>
<html>
`
    }] }] );

  });

});
