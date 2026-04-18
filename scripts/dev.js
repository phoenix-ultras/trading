const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function run(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`${name} exited with code ${code}`);
    }
  });

  return child;
}

const backend = run('backend', 'npm.cmd', ['run', 'dev', '--workspace', 'backend'], rootDir);
const frontend = run('frontend', 'npm.cmd', ['run', 'dev', '--workspace', 'frontend'], rootDir);

function shutdown(signal) {
  backend.kill(signal);
  frontend.kill(signal);
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
