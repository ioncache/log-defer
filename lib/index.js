(function() {

  // Ported from python version https://github.com/mikep/LogDefer/blob/master/LogDefer.py

  var _this = this;

  _this.levels = [40, 30, 20, 10];
  _this.message = {
    data: {},
    logs: [],
    start: new Date().getTime(),
    timers: {},
  };

  // add message to log object
  _this.addMessage = function(params) {
    var data = params.data || {};
    var level = params.level || 30;
    var message = params.message || "";
    
    var log = [_this._getEt(), level, message];

    if (data && arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++ ) {
        Object.assign(data, arguments[i]);
      }

      log.append(data);
    }

    _this.message.logs.append(log);
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

  // log-defer-viz uses time since the start time in logs and timers
  _this._getEt = function() {
    return (new Date().getTime()) - _this.message.start;
  };

  return function(params) {
    // TODO
  };

}());
