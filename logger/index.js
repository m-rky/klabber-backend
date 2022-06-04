const dayjs = require('dayjs');
const logger = require('pino');

const log = logger({
  prettyPrint: true,
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
});

module.exports = log;
