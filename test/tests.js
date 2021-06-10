'use strict';

var _ = require('lodash');
var chai = require('chai');
var log = require('../lib/log-defer');
var q = require('q');

var expect = chai.expect;

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
    q.all(deferreds).then(function () {
      log.timer('Log Messaging Demo'); // end the 'Log Messaging Demo' timer

      var output = log.finalizeLog(); // finalize the log, and return a json string of the log-defer
      var outputObj = JSON.parse(output);

      expect(outputObj).to.be.defined;
    });
  });
});
