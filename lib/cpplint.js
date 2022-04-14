'use strict';

const cp = require('child_process');
const EventEmitter = require('events');
const path = require('path');

const pi = require('detect-python-interpreter');

class CppLintResult extends EventEmitter {
  constructor(child) {
    super();

    this.errored = false;
    this.child = child;
    this.child.stdout.on('data', chunk => {
      this.emit('stdout', chunk.toString());
    });
    this.child.stderr.on('data', chunk => {
      this.emit('stderr', chunk.toString());
    });

    let resolve;
    let reject;
    this.finishPromise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    this.child.on('error', err => {
      this.errored = true;
      reject(err);
    });

    this.child.on('exit', code => {
      if (this.errored) return;
      resolve(code);
    });
  }

  finished() {
    return this.finishPromise;
  }
}

exports.run = function run(args, options = { cwd: process.cwd() }) {
  const interpreter = pi.detect();

  args = [
    path.join(__dirname, '../CPPLINT/cpplint.py'),
    ...args,
  ];

  const child = cp.spawn(interpreter, args, {
    stdio: 'pipe',
    cwd: options.cwd,
  });

  return new CppLintResult(child);
};
