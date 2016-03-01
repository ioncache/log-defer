'use strict';

var log = require('../lib/log-defer');
var process = require('process');

log.timer('Helper Tests');
log.info('Info test');
log.warn('Warn test');
log.error('Error test');
log.debug('Debug test');
log.timer('Helper Tests');
var output = log.finalizeLog();

process.stdout.write(output);
