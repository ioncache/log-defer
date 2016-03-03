/*
  Generate log object compatible with log-defer-viz
  https://github.com/hoytech/Log-Defer-Viz

  Ported from python version https://github.com/mikep/LogDefer/blob/master/LogDefer.py
*/

(function() {
  'use strict';

  var self = {
    message: {
      data: {},
      logs: [],
      start: new Date().getTime() / 1000,
      timers: {}
    }
  };

  /*
    Public methods
    ==============
  */

  // add message to log object
  self.addMessage = function() {
    if (arguments.length < 0 || typeof(arguments[0]) !== 'string') {
      return;
    }

    var args = Array.prototype.slice.call(arguments);

    var data = {};
    var level = 30;
    var message = args.shift();

    if (typeof(args[0]) === 'number') {
      level = args.shift();
    }

    var log = [self._getEt(), level, message];

    if (args.length > 0) {
      for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (typeof(arg) === 'object' && !Array.isArray(arg)) {
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
  self.timer = function(name) {
    self.name = name;

    if (name && !self.message.timers.hasOwnProperty(name)) {
      self.message.timers[name] = {
        name: name,
        start: self._getEt()
      };
    } else if (self.message.timers.hasOwnProperty(name)) {
      self.message.timers[name].end = self._getEt();
    }
  };

  self.data = function(data) {
    if (typeof(data) === 'object' && !Array.isArray(data)) {
      Object.assign(self.message.data, data);
    }
  };

  // format and return the log object for logging
  self.finalizeLog = function() {
    self._formatLogMessageOutput();

    var output = JSON.stringify(self.message);

    // reset after logging
    self.message.data = {};
    self.message.logs = [];
    self.message.timers = {};

    return output;
  };

  // log level functions
  self.debug = function() {
    var args = Array.prototype.slice.call(arguments);
    args.splice(1, 0, 40);
    self.addMessage.apply(this, args);
  };

  self.error = function() {
    var args = Array.prototype.slice.call(arguments);
    args.splice(1, 0, 10);
    self.addMessage.apply(this, args);
  };

  self.info = function() {
    var args = Array.prototype.slice.call(arguments);
    args.splice(1, 0, 30);
    self.addMessage.apply(this, args);
  };

  self.warn = function() {
    var args = Array.prototype.slice.call(arguments);
    args.splice(1, 0, 20);
    self.addMessage.apply(this, args);
  };

  /*
    Private methods
    ===============
  */

  self._formatLogMessageOutput = function() {
    // clean up, log-defer-viz doesn't like empty objects
    ['logs', 'timers', 'data'].forEach(function(key) {
      if (
          self.message.hasOwnProperty(key) &&
          (
            (self.message[key].hasOwnProperty('length') &&
            self.message[key].length === 0) ||
            Object.keys(self.message[key]).length === 0
          )
      ) {
        delete self.message[key];
      }
    });

    // convert timers to a list
    if (self.message.hasOwnProperty('timers')) {
      var timers = [];
      Object.keys(self.message.timers).forEach(function(key) {
        timers.push([
          self.message.timers[key].name,
          self.message.timers[key].start,
          self.message.timers[key].end || self._getEt()
        ]);
      });

      timers.sort(function(a, b) {
        return a[0] >= b[0];
      });

      self.message.timers = timers;
    }

    // record end time
    self.message.end = self._getEt();
  };

  // log-defer-viz uses time since the start time in logs and timers
  self._getEt = function() {
    return (new Date().getTime() / 1000) - self.message.start;
  };

  module.exports = {
    _self: self, // for testing only
    addMessage: self.addMessage,
    data: self.data,
    debug: self.debug,
    error: self.error,
    finalizeLog: self.finalizeLog,
    info: self.info,
    timer: self.timer,
    warn: self.warn
  };

}());
