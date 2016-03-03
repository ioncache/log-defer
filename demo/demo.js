'use strict';

var log = require('../lib/log-defer');
var process = require('process');

log.timer('Log Messages'); // begin a timer called 'Log Messages'
log.info('Info level logging');
log.warn('Warn level logging');
log.error('Error level logging');
log.debug('Debug level logging');
log.timer('Log Messages'); // end the 'Log Messages' timer
log.data({ bar: 'baz', foo: 'bar' }); // add to the data object in the log-defer

log.warn('Warning with data!', { bar: 'baz', foo: 'bar' }, { barbaz: 'bazfoo', foobar: 'barbaz' });

var output = log.finalizeLog(); // finalize the log, and return a json string of the log-defer

process.stdout.write(output);
