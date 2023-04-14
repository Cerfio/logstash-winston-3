const winston = require('winston');
const LogstashTransport = require('winston-logstash-transport');

class LogService {
  constructor(appName, logstashHost, logstashPort, logstashIndex) {
    this.logger = winston.createLogger({
      level: 'info',
      transports: [
        new LogstashTransport({
          host: logstashHost,
          port: logstashPort,
          ssl_enable: true,
          max_connect_retries: -1,
          index: logstashIndex,
        }),
      ],
      defaultMeta: { app_name: appName },
    });
  }

  log(level, message, meta) {
    this.logger.log(level, message, meta);
  }

  info(message, meta) {
    this.log('info', message, meta);
  }

  error(message, meta) {
    this.log('error', message, meta);
  }

  warn(message, meta) {
    this.log('warn', message, meta);
  }

  debug(message, meta) {
    this.log('debug', message, meta);
  }
}

module.exports = LogService;
