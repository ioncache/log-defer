'use strict';

var log = require('../lib/log-defer');

console.log(log);

log.error('this is a test');

var output = log.finalizeLog();

console.log(output);
