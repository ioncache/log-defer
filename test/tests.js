'use strict';

var chai = require('chai');
var log = require('../lib/log-defer');

var expect = chai.expect;

describe('Log level helpers', function() {
  describe('error', function() {
    it('should set the log level to 10', function() {
      log.error({ message: 'this is a test' });

      var outputObj = JSON.parse(log.finalizeLog());

      expect(outputObj.logs[0][1]).to.equal(10);
    });
  });

  describe('warn', function() {
    it('should set the log level to 20', function() {
      log.warn({ message: 'this is a test' });

      var outputObj = JSON.parse(log.finalizeLog());

      expect(outputObj.logs[0][1]).to.equal(20);
    });
  });

  describe('info', function() {
    it('should set the log level to 30', function() {
      log.info({ message: 'this is a test' });

      var outputObj = JSON.parse(log.finalizeLog());

      expect(outputObj.logs[0][1]).to.equal(30);
    });
  });

  describe('debug', function() {
    it('should set the log level to 40', function() {
      log.debug({ message: 'this is a test' });

      var outputObj = JSON.parse(log.finalizeLog());

      expect(outputObj.logs[0][1]).to.equal(40);
    });
  });
});
