'use strict';

// npm modules
var log = require('../lib/log-defer');
var process = require('process');
var q = require('q');

var deferreds = [];

log.timer('Log Messaging Demo'); // begin a timer called 'Log Messaging Demo'

log.info('Info level logging');
log.warn('Warn level logging');
log.error('Error level logging');
log.timer('Interleaved, longer running timer');
log.debug('Debug level logging');

log.timer('async timer');
log.info('starting async timer');
var deferred1 = q.defer();
deferreds.push(deferred1.promise);
setTimeout(function() {
  log.info('finishing async timer');
  log.timer('async timer');
  deferred1.resolve();
}, 375);

log.timer('Short timer');
var deferred2 = q.defer();
deferreds.push(deferred2);
setTimeout(function() {
  log.timer('Short timer');
  deferred2.resolve();
}, 125);

log.data({ bar: 'baz', foo: 'bar' }); // add to the data object in the log-defer
log.warn('Warning with data!', { bar: 'baz', foo: 'bar' }, { barbaz: 'bazfoo', foobar: 'barbaz' });

var deferred3 = q.defer();
deferreds.push(deferred3.promise);
setTimeout(function() {
  log.timer('Interleaved, longer running timer');
  deferred3.resolve();
}, 700);

log.data({ quux: 'xyzzy', qux: 'corge' });

q.all(deferreds).then(function() {
  log.timer('Log Messaging Demo'); // end the 'Log Messaging Demo' timer
  var output = log.finalizeLog(); // finalize the log, and return a json string of the log-defer

  process.stdout.write(output);
});
