'use strict';

var chai = require('chai');
var log = require('../lib/log-defer');

var expect = chai.expect;
var should = chai.should();

describe('log.error', function() {
  it('should set the log level to 10', function() {
    log.error({ message: 'this is a test' });

    var output = log.finalizeLog();
    var outputObj = JSON.parse(output);

    expect(outputObj.logs[0][1]).to.equal(10);
  });
});
