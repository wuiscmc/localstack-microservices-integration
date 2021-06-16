'use strict';

const LEVELS = {
	trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
	fatal: 5
};

const logLevel = () => {
  const level = process.env.LOG_LEVEL && !isNaN(LEVELS[process.env.LOG_LEVEL])
  ? process.env.LOG_LEVEL
  : 'info';

  return LEVELS[level];
};

const output = (level, msg) => {
  if(LEVELS[level] < logLevel()) {
    return;
  }

	if(typeof msg === 'string') {
		console.log(`[${level.toUpperCase()}] ${msg}`);
		return;
	}

	console.log(`[${level.toUpperCase()}] ${JSON.stringify(msg, null, 2)}`);
}

const errorOutput = (level, error) => {
  if(LEVELS[level] < logLevel()) {
    return;
  }

	if(typeof error === 'string') {
		output('error', error);
		return;
	}

	const stacktrace = JSON.stringify(error, Object.getOwnPropertyNames(error));

	console.log(`[${level.toUpperCase()}] ${stacktrace}`);
}

module.exports = {
	trace: (msg) => output('trace', msg),
	debug: (msg) => output('debug', msg),
	info: (msg) => output('info', msg),
	warn: (msg) => output('warn', msg),
	error: (err) => errorOutput('error', err),
	fatal: (err) => errorOutput('fatal', err),
}
