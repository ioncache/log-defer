/*
  Generate log object compatible with log-defer-viz
  https://github.com/hoytech/Log-Defer-Viz

  Ported from python version https://github.com/mikep/LogDefer/blob/master/LogDefer.py
*/

(function (global) {
  'use strict';

  function createMessage() {
    return {
      data: {},
      logs: [],
      start: new Date().getTime() / 1000,
      timers: Object.create(null),
    };
  }

  function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  function stringify(value) {
    var ancestors = [];

    return JSON.stringify(value, function (_key, val) {
      if (val && typeof val === 'object') {
        while (ancestors.length > 0 && ancestors[ancestors.length - 1] !== this) {
          ancestors.pop();
        }

        if (ancestors.indexOf(val) !== -1) {
          return String(val);
        }

        ancestors.push(val);
      }

      return val;
    });
  }

  function createLogDefer() {
    var self = {
      message: createMessage(),
    };

    /*
      Public methods
      ==============
    */

    // add message to log object
    self.addMessage = function () {
      if (arguments.length === 0 || typeof arguments[0] !== 'string') {
        return;
      }

      var args = Array.prototype.slice.call(arguments);

      var data = {};
      var level = 30;
      var message = args.shift();

      if (typeof args[0] === 'number') {
        level = args.shift();
      }

      var log = [self._getEt(), level, message];

      if (args.length > 0) {
        for (var i = 0; i < args.length; i++) {
          var arg = args[i];
          if (arg && typeof arg === 'object' && !Array.isArray(arg)) {
            Object.assign(data, arg);
          }
        }
      }

      if (Object.keys(data).length) {
        log.push(data);
      }

      self.message.logs.push(log);
    };

    // add timer to log object
    // if timer already exists, set the end time
    self.timer = function (name) {
      self.name = name;

      if (name && !hasOwn(self.message.timers, name)) {
        self.message.timers[name] = {
          name: name,
          start: self._getEt(),
        };
      } else if (hasOwn(self.message.timers, name)) {
        self.message.timers[name].end = self._getEt();
      }
    };

    self.data = function (data) {
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        Object.assign(self.message.data, data);
      }
    };

    // format and return the log object for logging
    self.finalizeLog = function () {
      self._formatLogMessageOutput();

      var output = stringify(self.message);

      // reset after logging
      self.message = createMessage();

      return output;
    };

    // log level functions
    self.debug = function () {
      var args = Array.prototype.slice.call(arguments);
      args.splice(1, 0, 40);
      self.addMessage.apply(this, args);
    };

    self.error = function () {
      var args = Array.prototype.slice.call(arguments);
      args.splice(1, 0, 10);
      self.addMessage.apply(this, args);
    };

    self.info = function () {
      var args = Array.prototype.slice.call(arguments);
      args.splice(1, 0, 30);
      self.addMessage.apply(this, args);
    };

    self.warn = function () {
      var args = Array.prototype.slice.call(arguments);
      args.splice(1, 0, 20);
      self.addMessage.apply(this, args);
    };

    /*
      Private methods
      ===============
    */

    self._formatLogMessageOutput = function () {
      // clean up, log-defer-viz doesn't like empty objects
      ['logs', 'timers', 'data'].forEach(function (key) {
        if (
          hasOwn(self.message, key) &&
          ((hasOwn(self.message[key], 'length') && self.message[key].length === 0) ||
            Object.keys(self.message[key]).length === 0)
        ) {
          delete self.message[key];
        }
      });

      // convert timers to a list
      if (hasOwn(self.message, 'timers')) {
        var timers = [];
        Object.keys(self.message.timers).forEach(function (key) {
          timers.push([
            self.message.timers[key].name,
            self.message.timers[key].start,
            self.message.timers[key].end || self._getEt(),
          ]);
        });

        timers.sort(function (a, b) {
          return a[1] - b[1];
        });

        self.message.timers = timers;
      }

      // record end time
      self.message.end = self._getEt();
    };

    // log-defer-viz uses time since the start time in logs and timers
    self._getEt = function () {
      return new Date().getTime() / 1000 - self.message.start;
    };

    return {
      _self: self, // for testing only
      addMessage: self.addMessage,
      create: createLogDefer,
      data: self.data,
      debug: self.debug,
      error: self.error,
      finalizeLog: self.finalizeLog,
      info: self.info,
      timer: self.timer,
      warn: self.warn,
    };
  }

  var logDefer = createLogDefer();

  // no strong need to test the import code
  /* istanbul ignore next */
  if (typeof define === 'function' && define.amd) {
    define('log-defer', [], logDefer);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = logDefer;
  } else {
    global.logDefer = logDefer;
  }
})(this);
