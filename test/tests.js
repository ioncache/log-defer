'use strict';

var _ = require('lodash');
var log = require('../lib/log-defer');
var q = require('q');

var expect;

before(async function () {
  ({ expect } = await import('chai'));
});

afterEach(function () {
  log.finalizeLog();
});

describe("function 'addMessage':", function () {
  it('should add a message to the current log list', function () {
    // Arrange
    var message = 'message adding test';

    // Act
    log.addMessage(message);

    // Assert
    expect(log._self.message.logs.length).to.equal(1);
    expect(log._self.message.logs[0][2]).to.equal(message);
  });

  describe('when there is a level option', function () {
    it('should set the level to the correct value', function () {
      // Arrange
      var message = 'setting level test';

      // Act
      log.addMessage(message, 10);

      // Assert
      expect(log._self.message.logs[0][1]).to.equal(10);
    });
  });

  describe('when there is a data option', function () {
    it('should combine all into the log', function () {
      // Arrange
      var data = { foo: 'bar' };
      var data2 = { bar: 'baz' };
      var data3 = { baz: 'meh' };
      var message = 'setting data';

      // Act
      log.addMessage(message, data, data2, data3);

      // Assert
      expect(log._self.message.logs[0][3]).to.eql(_.extend({}, data, data2, data3));
    });

    // not sure why non-object args are ignored
    // would need to go back to the log-defer spec
    it('should ignore non-object arguments', function () {
      // Arrange
      var data = { foo: 'bar' };
      var data2 = { bar: 'baz' };
      var data3 = [
        {
          baz: 'meh',
          qux: {
            quux: 1,
            quuz: 2,
            corge: '4',
          },
        },
      ];
      var data4 = 0;
      var data5 = 'this is not an object';
      var message = 'setting data';

      // Act
      log.addMessage(message, data, data2, data3, data4, data5);

      // Assert
      expect(log._self.message.logs[0][3]).to.eql(_.extend({}, data, data2));
    });

    it('should ignore null data arguments', function () {
      // Act
      log.addMessage('setting null data', null);

      // Assert
      expect(log._self.message.logs[0].length).to.equal(3);
    });
  });

  describe('when there is an invalid log message', function () {
    it('should do nothing', function () {
      // Arrange
      var data = { foo: 'bar' };
      var data2 = { bar: 'baz' };
      var data3 = { baz: 'meh' };
      var message = 'setting data';

      // Act
      log.addMessage(0, data, data2, data3);

      // Assert
      expect(log._self.message.logs.length).to.eql(0);

      // Act
      log.addMessage();

      // Assert
      expect(log._self.message.logs.length).to.eql(0);
    });
  });
});

describe("function 'timer':", function () {
  describe('when called and the timer name does not exist', function () {
    it('then a new timer should be started', function () {
      // Arrange
      var timerName = 'foo';

      // Act
      log.timer(timerName);

      // Assert
      expect(log._self.message.timers[timerName]).to.exist;
      expect(log._self.message.timers[timerName].start).to.exist;
      expect(log._self.message.timers[timerName].end).to.not.exist;
    });
  });

  describe('when called and the timer name does exist', function () {
    it('then an end time should be added to the timer', function () {
      // Arrange
      var timerName = 'foo';

      // Act
      log.timer(timerName);
      log.timer(timerName);

      // Assert
      expect(log._self.message.timers[timerName].end).to.exist;
    });
  });

  it('should support object prototype names', function () {
    // Act
    log.timer('__proto__');
    log.timer('__proto__');

    // Assert
    expect(log._self.message.timers.__proto__.end).to.exist;
  });

  it('should sort timers by start time', function () {
    // Arrange
    log._self.message.timers = {
      second: { name: 'second', start: 2, end: 3 },
      first: { name: 'first', start: 1, end: 2 },
    };

    // Act
    var output = JSON.parse(log.finalizeLog());

    // Assert
    expect(output.timers[0][0]).to.equal('first');
    expect(output.timers[1][0]).to.equal('second');
  });
});

describe("function 'data':", function () {
  it('should ignore null data', function () {
    // Act
    log.data(null);

    // Assert
    expect(log._self.message.data).to.be.empty;
  });
});

describe("function 'finalizeLog':", function () {
  it('should return a json string', function () {
    // Act
    log.info('this is a test');
    var output = log.finalizeLog();

    // Assert
    expect(typeof output).to.equal('string');
    expect(typeof JSON.parse(output)).to.equal('object');
  });

  it('should clear the current log', function () {
    // Act
    log.info('this is a test');
    log.finalizeLog();

    // Assert
    expect(log._self.message.data).to.be.empty;
    expect(log._self.message.logs).to.be.empty;
    expect(log._self.message.timers).to.be.empty;
  });

  it('should reset the start time for the next log', function () {
    // Arrange
    log._self.message.start = 0;

    // Act
    log.finalizeLog();
    log.info('next log');

    // Assert
    expect(log._self.message.logs[0][0]).to.be.lessThan(1);
  });

  it('should stringify circular data', function () {
    // Arrange
    var data = {};
    data.self = data;
    log.data({ data: data });

    // Act
    var output = JSON.parse(log.finalizeLog());

    // Assert
    expect(output.data.data.self).to.equal('[object Object]');
  });

  it('should preserve repeated non-circular data', function () {
    // Arrange
    var data = { value: 'same object' };
    log.data({ first: data, second: data });

    // Act
    var output = JSON.parse(log.finalizeLog());

    // Assert
    expect(output.data.first).to.eql(data);
    expect(output.data.second).to.eql(data);
  });
});

describe("function 'create':", function () {
  it('should create isolated loggers', function () {
    // Arrange
    var first = log.create();
    var second = log.create();

    // Act
    first.info('first');
    first.data({ logger: 'first' });
    first.timer('first timer');
    second.info('second');
    second.data({ logger: 'second' });
    second.timer('second timer');

    // Assert
    expect(first._self.message.logs[0][2]).to.equal('first');
    expect(second._self.message.logs[0][2]).to.equal('second');
    expect(first._self.message.data.logger).to.equal('first');
    expect(second._self.message.data.logger).to.equal('second');
    expect(first._self.message.timers['first timer']).to.exist;
    expect(second._self.message.timers['first timer']).to.not.exist;
  });
});

describe('Log level helpers', function () {
  describe('error', function () {
    it('should set the log level to 10', function () {
      // Act
      log.error('this is an error test');
      var outputObj = JSON.parse(log.finalizeLog());

      // Assert
      expect(outputObj.logs[0][1]).to.equal(10);
    });
  });

  describe('warn', function () {
    it('should set the log level to 20', function () {
      // Act
      log.warn('this is a warn test');
      var outputObj = JSON.parse(log.finalizeLog());

      // Assert
      expect(outputObj.logs[0][1]).to.equal(20);
    });
  });

  describe('info', function () {
    it('should set the log level to 30', function () {
      // Act
      log.info('this is an info test');
      var outputObj = JSON.parse(log.finalizeLog());

      // Assert
      expect(outputObj.logs[0][1]).to.equal(30);
    });
  });

  describe('debug', function () {
    it('should set the log level to 40', function () {
      // Act
      log.debug('this is a debug');
      var outputObj = JSON.parse(log.finalizeLog());

      // Assert
      expect(outputObj.logs[0][1]).to.equal(40);
    });
  });
});

describe('multiple logs, timers, and data', function () {
  it('the output should match all log statements', function () {
    // Act
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
    setTimeout(function () {
      log.info('finishing async timer');
      log.timer('async timer');
      deferred1.resolve();
    }, 375);

    log.timer('Short timer');
    var deferred2 = q.defer();
    deferreds.push(deferred2);
    setTimeout(function () {
      log.timer('Short timer');
      deferred2.resolve();
    }, 125);

    log.data({ bar: 'baz', foo: 'bar' }); // add to the data object in the log-defer
    log.warn('Warning with data!', { bar: 'baz', foo: 'bar' }, { barbaz: 'bazfoo', foobar: 'barbaz' });

    var deferred3 = q.defer();
    deferreds.push(deferred3.promise);
    setTimeout(function () {
      log.timer('Interleaved, longer running timer');
      deferred3.resolve();
    }, 700);

    log.data({ quux: 'xyzzy', qux: 'corge' });

    // Assert
    return q.all(deferreds).then(function () {
      log.timer('Log Messaging Demo'); // end the 'Log Messaging Demo' timer

      var output = log.finalizeLog(); // finalize the log, and return a json string of the log-defer
      var outputObj = JSON.parse(output);

      expect(outputObj).to.exist;
    });
  });
});
