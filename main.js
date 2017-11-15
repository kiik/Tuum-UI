#!/usr/bin/env nodejs

const libtuumui = require('libtuumui-njs');

const factory = require('./src');


var gApp = null,
    gSrv = null;


function setup() {
  gApp = factory.create_app();
  gSrv = libtuumui.serve_http(gApp);

  gSrv.listen(9080, function listening() {
    console.log('[trd-ui/main]Listening on %d', gSrv.address().port);
  });
}


setup();
