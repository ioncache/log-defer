(function() {

  // Ported from python version https://github.com/mikep/LogDefer/blob/master/LogDefer.py

  var _this = this;

  _this.message = {
    data: {},
    logs: [],
    start: new Date().getTime(),
    timers: {},
  };

  /*
    Public methods
    ==============
  */

  // add message to log object
  _this.addMessage = function(params) {
    var data = params.data || {};
    var level = params.level || 30;
    var message = params.message || '';

    var log = [_this._getEt(), level, message];

    if (data) {
      if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
          Object.assign(data, arguments[i]);
        }
      }

      log.push(data);
    }

    _this.message.logs.push(log);
  };

  // add timer to log object
  // if timer already exists, set the end time
  _this.timer = function(name) {
    _this.name = name;

    if (name && !_this.message.timers.hasOwnProperty(name)) {
      _this.message.timers[name] = {
        name: name,
        start: _this._getEt(),
      };
    } else {
      _this.message.timers[name].end = _this._getEt();
    }
  };

  // format and return the log object for logging
  _this.finalizeLog = function() {
    _this._formatLogMessageOutput();
    return JSON.stringify(_this.message);
  };

  // log level functions
  _this.debug = function(params) {
    arguments[0] = arguments[0] || {};
    arguments[0].level = 40;
    _this.addMessage(arguments);
  };

  _this.error = function(params) {
    arguments[0] = arguments[0] || {};
    arguments[0].level = 10;
    _this.addMessage(arguments);
  };

  _this.info = function(params) {
    arguments[0] = arguments[0] || {};
    arguments[0].level = 30;
    _this.addMessage(arguments);
  };

  _this.warn = function(params) {
    arguments[0] = arguments[0] || {};
    arguments[0].level = 20;
    _this.addMessage(arguments);
  };

  /*
    Private methods
    ===============
  */

  _this._formatLogMessageOutput = function() {
    // clean up, log-defer-viz doesn't like empty objects
    ['logs', 'timers', 'data'].forEach(function(key) {
      if (
          typeof _this.message[key] === 'object' &&
          (
            (_this.message[key].hasOwnProperty('length') &&
            _this.message[key].length === 0) ||
            Object.keys(_this.message[key]).length === 0
          )
      ) {
        delete _this.message[key];
      }
    });

    // convert timers to a list
    if (_this.message.hasOwnProperty('timers')) {
      var timers = [];
      Object.keys(_this.message.timers).forEach(function(key) {
        timers.push([
          _this.message.timers[key].name,
          _this.message.timers[key].start,
          _this.message.timers[key].end || _this._getEt(),
        ]);
      });
    }

    _this.message.timers = timers;

    // record end time
    _this.message.end = _this._getEt();
  };

  // log-defer-viz uses time since the start time in logs and timers
  _this._getEt = function() {
    return (new Date().getTime()) - _this.message.start;
  };

  module.exports = {
    addMessage: _this.addMessage,
    debug: _this.debug,
    error: _this.error,
    finalizeLog: _this.finalizeLog,
    info: _this.info,
    timer: _this.timer,
    warn: _this.warn,
  };

}());
