'use strict';

var log = require('../lib/log-defer');
var process = require('process');

log.timer('Helper Tests');
log.info('Info test');
log.warn('Warn test');
log.error('Error test');
log.debug('Debug test');
log.timer('Helper Tests');

log.warn('Warning with data!', { bar: 'baz', foo: 'bar' }, { barbaz: 'bazfoo', foobar: 'barbaz' });

log.data({ a: 'b', b: 'c' });

var output = log.finalizeLog();

process.stdout.write(output);
