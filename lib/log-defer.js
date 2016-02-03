(function() {
  'use strict';

  // Ported from python version https://github.com/mikep/LogDefer/blob/master/LogDefer.py

  var self = {};

  self.message = {
    data: {},
    logs: [],
    start: new Date().getTime() / 1000,
    timers: {}
  };

  /*
    Public methods
    ==============
  */

  // add message to log object
  self.addMessage = function(params) {
    var data = params.data || {};
    var level = params.level || 30;
    var message = params.message || '';

    var log = [self._getEt(), level, message];

    if (data) {
      if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
          Object.assign(data, arguments[i]);
        }
      }

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
    } else {
      self.message.timers[name].end = self._getEt();
    }
  };

  // format and return the log object for logging
  self.finalizeLog = function() {
    self._formatLogMessageOutput();
    var output = JSON.stringify(self.message);

    // reset after logging
    self.data = {};
    self.logs = [];
    self.timers = {};

    return output;
  };

  // log level functions
  self.debug = function() {
    var params = arguments[0] || {};
    params.level = 40;
    var opts = [];
    for (var i = 1; i < arguments.length; i++) {
      opts.push(arguments[i]);
    }

    self.addMessage(params, opts);
  };

  self.error = function() {
    var params = arguments[0] || {};
    params.level = 10;
    var opts = [];
    for (var i = 1; i < arguments.length; i++) {
      opts.push(arguments[i]);
    }

    self.addMessage(params, opts);
  };

  self.info = function() {
    var params = arguments[0] || {};
    params.level = 30;
    var opts = [];
    for (var i = 1; i < arguments.length; i++) {
      opts.push(arguments[i]);
    }

    self.addMessage(params, opts);
  };

  self.warn = function() {
    var params = arguments[0] || {};
    params.level = 20;
    var opts = [];
    for (var i = 1; i < arguments.length; i++) {
      opts.push(arguments[i]);
    }

    self.addMessage(params, opts);
  };

  /*
    Private methods
    ===============
  */

  self._formatLogMessageOutput = function() {
    // clean up, log-defer-viz doesn't like empty objects
    ['logs', 'timers', 'data'].forEach(function(key) {
      if (
          self.message.hasOwnProperty('key') &&
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
    addMessage: self.addMessage,
    debug: self.debug,
    error: self.error,
    finalizeLog: self.finalizeLog,
    info: self.info,
    timer: self.timer,
    warn: self.warn
  };

}());
