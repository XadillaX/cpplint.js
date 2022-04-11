'use strict';

const cp = require('child_process');

let pythonInterpreter;

function getPythonInterpreter() {
  const interpreterOptions = [ 'python3', 'python', 'python2' ];
  for (const opt of interpreterOptions) {
    const result = cp.spawnSync(opt, [ '--version' ], {
      encoding: 'utf-8',
    });

    if (result.status === 0) {
      return opt;
    }
  }
  return null;
}

exports.pythonInterpreter = () => {
  if (pythonInterpreter) {
    return pythonInterpreter;
  }

  pythonInterpreter = getPythonInterpreter();
  if (!pythonInterpreter) {
    throw new Error('Could not find a Python interpreter.');
  }

  return pythonInterpreter;
};

exports.clearCache = () => {
  pythonInterpreter = null;
};
