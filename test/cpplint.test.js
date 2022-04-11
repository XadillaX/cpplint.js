'use strict';

const assert = require('assert');
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const cpplint = require('../lib/cpplint');

async function testCase(group, def) {
  const defFilename = path.join(__dirname, '../CPPLINT/samples', group, def);
  const defContent = fs.readFileSync(defFilename, 'utf8').split('\n');

  const args = defContent[0].split(' ');
  defContent.shift();
  const expectedStatus = Number(defContent[0]);
  defContent.shift();
  const stdoutLines = Number(defContent[0]);
  defContent.shift();

  args.unshift(`--repository=${path.join(__dirname, '../CPPLINT')}`);
  const realArgs = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('-')) {
      realArgs.push(args[i]);
    } else {
      const ret = cp.execSync(`echo ${args[i]}`, {
        cwd: path.join(__dirname, '../CPPLINT/samples', group),
        encoding: 'utf8',
      });
      const additional = ret.split(' ').map(x => x.trim()).filter(x => x);
      realArgs.push(...additional);
    }
  }

  const ret = await cpplint.run(realArgs, { cwd: path.dirname(defFilename) });
  let stdout = '';
  let stderr = '';
  let mixedStd = '';

  for (const { type, data } of ret.output) {
    if (type === 'stdout') {
      stdout += data.toString();
    } else if (type === 'stderr') {
      stderr += data.toString();
    }

    mixedStd += data.toString();
  }

  assert.strictEqual(ret.code, expectedStatus, mixedStd);
  const stdoutSplitted = stdout.split('\n');
  assert.strictEqual(stdoutSplitted.length, stdoutLines);
  for (let i = 0; i < stdoutLines; i++) {
    assert.strictEqual(stdoutSplitted[i], defContent[0]);
    defContent.shift();
  }

  assert.strictEqual(`${stderr}\n`, defContent.join('\n'));
}

describe('cpplint.test.js', () => {
  const groups = fs.readdirSync(path.join(__dirname, '../CPPLINT/samples'));
  groups.forEach(group => {
    const stats = fs.statSync(path.join(__dirname, '../CPPLINT/samples', group));
    if (!stats.isDirectory()) return;

    describe(group, () => {
      const defs = fs.readdirSync(path.join(__dirname, '../CPPLINT/samples', group));
      defs.forEach(def => {
        if (!def.endsWith('.def')) return;
        it(def, async () => {
          await testCase(group, def);
        });
      });
    });
  });
});
