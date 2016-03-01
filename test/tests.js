'use strict';

var chai = require('chai');
var log = require('../lib/log-defer');

var expect = chai.expect;

describe('function \'timer\':', function() {
  describe('when called and the name does not exist', function() {
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

  describe('when called and the name does not exist', function() {
    it('then the timer should have an end time', function() {
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

describe('Log level helpers', function() {
  describe('error', function() {
    it('should set the log level to 10', function() {
      // Act
      log.error({ message: 'this is a test' });
      var outputObj = JSON.parse(log.finalizeLog());

      // Assert
      expect(outputObj.logs[0][1]).to.equal(10);
    });
  });

  describe('warn', function() {
    it('should set the log level to 20', function() {
      // Act
      log.warn({ message: 'this is a test' });
      var outputObj = JSON.parse(log.finalizeLog());

      // Assert
      expect(outputObj.logs[0][1]).to.equal(20);
    });
  });

  describe('info', function() {
    it('should set the log level to 30', function() {
      // Act
      log.info({ message: 'this is a test' });
      var outputObj = JSON.parse(log.finalizeLog());

      // Assert
      expect(outputObj.logs[0][1]).to.equal(30);
    });
  });

  describe('debug', function() {
    it('should set the log level to 40', function() {
      // Act
      log.debug({ message: 'this is a test' });
      var outputObj = JSON.parse(log.finalizeLog());

      // Assert
      expect(outputObj.logs[0][1]).to.equal(40);
    });
  });
});
