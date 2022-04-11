'use strict';

const cp = require('child_process');
const path = require('path');

const pi = require('./python_interpreter');

exports.run = async function run(args, options = { cwd: process.cwd() }) {
  let res;
  let rej;
  const promise = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  const interpreter = pi.pythonInterpreter();

  const output = [];
  args = [
    path.join(__dirname, '../CPPLINT/cpplint.py'),
    ...args,
  ];

  const child = cp.spawn(interpreter, args, {
    stdio: 'pipe',
    cwd: options.cwd,
  });

  child.stdout.on('data', data => {
    output.push({ type: 'stdout', data });
  });

  child.stderr.on('data', data => {
    output.push({ type: 'stderr', data });
  });

  let errored = false;
  child.on('error', err => {
    errored = true;
    rej(err);
  });

  child.on('exit', code => {
    if (errored) return;
    res({
      code,
      output,
    });
  });

  return promise;
};
