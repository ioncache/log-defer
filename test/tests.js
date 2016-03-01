'use strict';

var _ = require('lodash');
var chai = require('chai');
var log = require('../lib/log-defer');

var expect = chai.expect;

afterEach(function() {
  log.finalizeLog();
});

describe('function \'addMessage\':', function() {
  it('should add a message to the current log list', function() {
    // Arrange
    var message = 'message adding test';

    // Act
    log.addMessage({ message: message });

    // Assert
    expect(log._self.message.logs.length).to.equal(1);
    expect(log._self.message.logs[0][2]).to.equal(message);
  });

  describe('when there is a level option', function() {
    it('should set the level to the correct value', function() {
      // Arrange
      var message = 'setting level test';

      // Act
      log.addMessage({ level: 10, message: message });

      // Assert
      expect(log._self.message.logs[0][1]).to.equal(10);
    });
  });

  describe('when there is a data option', function() {
    it('should set the data object on the log', function() {
      // Arrange
      var data = { foo: 'bar' };
      var message = 'setting data';

      // Act
      log.addMessage({ data: data, message: message });

      // Assert
      expect(log._self.message.logs[0][3]).to.eql(data);
    });
  });

  describe('when there is a data option and extra data arguments', function() {
    it('should combine all into the log', function() {
      // Arrange
      var data = { foo: 'bar' };
      var data2 = { bar: 'baz' };
      var data3 = { baz: 'meh' };
      var message = 'setting data';

      // Act
      log.addMessage({ data: data, message: message }, data2, data3);

      // Assert
      expect(log._self.message.logs[0][3]).to.eql(_.extend({}, data, data2, data3));
    });
  });

  describe('when there are extra data arguments and no data option', function() {
    it('should combine all into the log', function() {
      // Arrange
      var data2 = { bar: 'baz' };
      var data3 = { baz: 'meh' };
      var message = 'setting data';

      // Act
      log.addMessage({ message: message }, data2, data3);

      // Assert
      expect(log._self.message.logs[0][3]).to.eql(_.extend({}, data2, data3));
    });
  });
});

describe('function \'timer\':', function() {
  describe('when called and the timer name does not exist', function() {
    it('then a new timer should be started', function() {
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

  describe('when called and the timer name does exist', function() {
    it('then an end time should be added to the timer', function() {
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

describe('function \'finalizeLog\':', function() {
  it('should return a json string', function() {
    // Act
    log.info({ message: 'this is a test' });
    var output = log.finalizeLog();

    // Assert
    expect(typeof(output)).to.equal('string');
    expect(typeof(JSON.parse(output))).to.equal('object');
  });

  it('should clear the current log', function() {
    // Act
    log.info({ message: 'this is a test' });
    log.finalizeLog();

    // Assert
    expect(log._self.message.data).to.be.empty;
    expect(log._self.message.logs).to.be.empty;
    expect(log._self.message.timers).to.be.empty;
  });
});

describe('Log level helpers', function() {
  describe('error', function() {
    it('should set the log level to 10', function() {
      // Act
      log.error('this is an error test');
      var outputObj = JSON.parse(log.finalizeLog());

      // Assert
      expect(outputObj.logs[0][1]).to.equal(10);
    });
  });

  describe('warn', function() {
    it('should set the log level to 20', function() {
      // Act
      log.warn('this is a warn test');
      var outputObj = JSON.parse(log.finalizeLog());

      // Assert
      expect(outputObj.logs[0][1]).to.equal(20);
    });
  });

  describe('info', function() {
    it('should set the log level to 30', function() {
      // Act
      log.info('this is an info test');
      var outputObj = JSON.parse(log.finalizeLog());

      // Assert
      expect(outputObj.logs[0][1]).to.equal(30);
    });
  });

  describe('debug', function() {
    it('should set the log level to 40', function() {
      // Act
      log.debug('this is a debug');
      var outputObj = JSON.parse(log.finalizeLog());

      // Assert
      expect(outputObj.logs[0][1]).to.equal(40);
    });
  });
});
