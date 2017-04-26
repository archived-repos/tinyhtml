
# tinyhtml

[![npm](https://img.shields.io/npm/v/tinyhtml.svg?maxAge=2592000)](https://www.npmjs.com/package/tinyhtml)
[![Build Status](https://travis-ci.org/kiltjs/live-dom.svg?branch=master)](https://travis-ci.org/kiltjs/live-dom)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Compact, reliable and customizable HTML minifier.

### Installation

``` sh
npm install tinyhtml --save-dev
```

### Usage

``` js

var tinyHTML = require('tinyhtml');

tinyHTML(`
<body class="mediawiki ltr sitedir-ltr mw-hide-empty-elt ns-4 ns-subject page-Wikipedia_Portada rootpage-Wikipedia_Portada skin-vector action-view">    <div id="mw-page-base" class="noprint"></div>
    <div id="mw-head-base" class="noprint"></div>
    <div id="content" class="mw-body" role="main">
      <a id="top"></a>

              <div id="siteNotice" class="mw-body-content"><!-- CentralNotice --></div>
            <div class="mw-indicators mw-body-content">
</div>
      <h1 id="firstHeading" class="firstHeading" lang="es">Wikipedia:Portada</h1>
                  <div id="bodyContent" class="mw-body-content">
                  <div id="siteSub">De Wikipedia, la enciclopedia libre</div>
                <div id="contentSub"></div>
                        <div id="jump-to-nav" class="mw-jump">
          Saltar a:          <a href="#mw-head">navegación</a>,           <a href="#p-search">búsqueda</a>
        </div>
        <div id="mw-content-text" lang="es" dir="ltr" class="mw-content-ltr"><table style="margin:4px 0 0 0; width:100%; background:none">
<tr>
<td class="MainPageBG" style="width:100%; border:1px solid #C7D0F8; background:#F2F5FD; vertical-align:top; color:#000; -moz-border-radius:4px; -webkit-border-radius: 4px; border-radius: 4px;">
`);
```

> Result

``` html
<body class="mediawiki ltr sitedir-ltr mw-hide-empty-elt ns-4 ns-subject page-Wikipedia_Portada rootpage-Wikipedia_Portada skin-vector action-view"><div id="mw-page-base" class="noprint"></div><div id="mw-head-base" class="noprint"></div><div id="content" class="mw-body" role="main"><a id="top"></a><div id="siteNotice" class="mw-body-content"></div>
<div class="mw-indicators mw-body-content"></div><h1 id="firstHeading" class="firstHeading" lang="es">Wikipedia:Portada</h1><div id="bodyContent" class="mw-body-content"><div id="siteSub">De Wikipedia, la enciclopedia libre</div><div id="contentSub"></div>
<div id="jump-to-nav" class="mw-jump">Saltar a:<a href="#mw-head">navegación</a>,<a href="#p-search">búsqueda</a></div><div id="mw-content-text" lang="es" dir="ltr" class="mw-content-ltr"><table style="margin:4px 0 0 0; width:100%; background:none"><tr><td class="MainPageBG" style="width:100%; border:1px solid #C7D0F8; background:#F2F5FD; vertical-align:top; color:#000; -moz-border-radius:4px; -webkit-border-radius: 4px; border-radius: 4px;">
```

### Parsing Tags

``` js
var htmlSnippet = `foo<script src="http://example.com/script.js">
  var hola = function caracola () {};
</script>bar`;

tinyHTML(htmlSnippet, {
  parsers: {
    script: function (tag) {
      return tag.body + '\n  var href = \'' + tag.attrs.src + '\';\n';
    }
  }
});
```

> Result

``` html
foo<script src="http://example.com/script.js">
  var hola = function caracola () {};
  var href = 'http://example.com/script.js';
</script>bar
```
