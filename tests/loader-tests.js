/* global describe, it */

var loadHTML = require('../loader'),
    assert = require('assert');

describe('loader', function () {

  it('div', function () {

    assert.strictEqual( loadHTML(`
<div id="foobar">foo</div>
    `), `export default [{attrs:{id:'foobar'},_:[{text:'foo'}],$:'div'}];` );

  });

  it('style', function () {

    assert.strictEqual( loadHTML(`<style>
  @import '/assets/styles.css';
</style>`), `export default [{_:'\\n  @import \\'/assets/styles.css\\';\\n',$:'style'}];` );

  });

});
