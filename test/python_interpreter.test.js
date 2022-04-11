'use strict';

const assert = require('assert');
const cp = require('child_process');

const mm = require('mm');

const pythonInterpreter = require('../lib/python_interpreter');

describe('python_interpreter.test.js', () => {
  let hasPython = [];

  beforeEach(() => {
    pythonInterpreter.clearCache();
    hasPython = [];
    mm(cp, 'spawnSync', command => {
      if (hasPython.includes(command)) {
        return {
          status: 0,
          stdout: '',
          stderr: '',
        };
      }

      return {
        status: 1,
      };
    });
  });

  afterEach(() => {
    mm.restore();
    pythonInterpreter.clearCache();
  });

  const pythons = [{
    hit: 'python3',
    has: [ 'python3' ],
  }, {
    hit: 'python',
    has: [ 'python' ],
  }, {
    hit: 'python2',
    has: [ 'python2' ],
  }, {
    has: [ 'python3', 'python2' ],
    hit: 'python3',
  }, {
    has: [ 'python3', 'python' ],
    hit: 'python3',
  }, {
    has: [ 'python2', 'python' ],
    hit: 'python',
  }, {
    has: [ 'python', 'python2', 'python3' ],
    hit: 'python3',
  }, {
    has: [ 'python:)' ],
    hit: null,
  }];

  pythons.forEach(({ has, hit }) => {
    it(`should find ${hit} with ${has.join(', ')}`, () => {
      hasPython = has;

      if (hit) {
        assert.strictEqual(pythonInterpreter.pythonInterpreter(), hit);
      } else {
        assert.throws(() => pythonInterpreter.pythonInterpreter(), /Could not find a Python interpreter./);
      }
    });
  });
});
