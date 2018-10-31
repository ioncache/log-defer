log-defer
=========

Description
-----------
Generate log object compatible with [log-defer-viz](https://github.com/hoytech/Log-Defer-Viz)

log-defer is a module that creates structured logs. The log-defer documentation explains structured logging and its benefits over ad-hoc logging.

This is the javascript implementation, full documentation for log-defer can be found at https://metacpan.org/pod/Log::Defer

Installation
------------

```npm install log-defer```

Synopsis
--------

``` javascript
'use strict';

var log = require('log-defer');
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

// should produce the following:
// {"data":{"bar":"baz","foo":"bar"},"logs":[[0.0009999275207519531,30,"Info level logging"],[0.0009999275207519531,20,"Warn level logging"],[0.0009999275207519531,10,"Error level logging"],[0.0009999275207519531,40,"Debug level logging"],[0.0009999275207519531,20,"Warning with data!",{"bar":"baz","foo":"bar","barbaz":"bazfoo","foobar":"barbaz"}]],"start":1457018806.914,"timers":[["Log Messages",0.0009999275207519531,0.0009999275207519531]],"end":0.0019998550415039062}

// if viewed using the log-defer-viz cli then it would format as follows:
------ 2016-03-03 Thu 10:26:46.914 EST (1457018806.914) ------
  | 0.001000 [ INFO] Info level logging
  | 0.001000 [ WARN] Warn level logging
  | 0.001000 [ERROR] Error level logging
  | 0.001000 [DEBUG] Debug level logging
  | 0.001000 [ WARN] Warning with data! [{"foo":"bar","bar":"baz","foobar":"barbaz","barbaz":"bazfoo"}]
  |_0.002000 [END]

 Log Messages                                                                                  X
_______________________________________________________________________________________________________
times in ms                                                                                    1.0

  Data:
{
   "bar" : "baz",
   "foo" : "bar"
}
```
