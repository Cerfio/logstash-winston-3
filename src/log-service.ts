import * as winston from "winston";
const LogstashTransport = require("winston-logstash/lib/winston-logstash-latest");

class LogService {
	private static instance: LogService;
	private logger: winston.Logger;
	private serviceName: string;
    private prettyPrint: boolean = false;

	private constructor({
		serviceName,
		logstashHost,
		logstashPort,
		maxConnectRetries = -1,
		sslEnable = false,
		level = "info",
		stringify = false,
		prettyPrint = false,
		showLevel = true,
		silent = false,
	}: {
		serviceName: string;
		logstashHost: string;
		logstashPort: number;
		maxConnectRetries?: number;
		sslEnable?: boolean;
		level?: string;
		stringify?: boolean;
		prettyPrint?: boolean;
		showLevel?: boolean;
		silent?: boolean;
	}) {
		console.log("LogService constructor");
		try {
			this.logger = winston.createLogger({
				level,
				format: winston.format.combine(
					winston.format.timestamp(),
					winston.format.errors({ stack: true }),
					winston.format.splat(),
					winston.format.json({ space: prettyPrint ? 2 : 0 }),
					winston.format.printf(({ level, message, timestamp, stack }) => {
						const obj: { [key: string]: any } = {
							timestamp: timestamp,
							level: level.toUpperCase(),
							message: message,
							serviceName: this.serviceName,
						};
						if (stack) {
							obj.stack = stack;
						}
						return JSON.stringify(obj, null, prettyPrint ? 2 : 0);
					}),
				),
				transports: [
					new LogstashTransport({
						host: logstashHost,
						port: logstashPort,
						ssl_enable: sslEnable,
						max_connect_retries: maxConnectRetries,
					}),
				],
				silent,
				exitOnError: false,
			});
		} catch (e) {
			console.log("Cannot establish connection to logstash", e);
		}
		this.serviceName = serviceName;
	}

	public static getInstance({
		serviceName,
		logstashHost,
		logstashPort,
		maxConnectRetries = -1,
		sslEnable = false,
		level = "info",
		stringify = false,
		prettyPrint = false,
		showLevel = true,
		silent = false,
	}: {
		serviceName: string;
		logstashHost: string;
		logstashPort: number;
		maxConnectRetries?: number;
		sslEnable?: boolean;
		level?: string;
		stringify?: boolean;
		prettyPrint?: boolean;
		showLevel?: boolean;
		silent?: boolean;
	}): LogService {
		if (!LogService.instance) {
			LogService.instance = new LogService({
				serviceName,
				logstashHost,
				logstashPort,
				maxConnectRetries,
				sslEnable,
				level,
				stringify,
				prettyPrint,
				showLevel,
				silent,
			});
		}
		return LogService.instance;
	}

	public log(level: string, message: string, meta?: object): void {
		this.logger.log(level, message, { ...meta, serviceName: this.serviceName });
	}

	public info(message: string, meta?: object): void {
		this.log("info", message, meta);
	}

	public error(message: string, meta?: object): void {
		this.log("error", message, meta);
	}

	public warn(message: string, meta?: object): void {
		this.log("warn", message, meta);
	}

	public debug(message: string, meta?: object): void {
		this.log("debug", message, meta);
	}

	public setLevel(level: string): void {
		this.logger.level = level;
	}

    public setStringifyLogs(stringify: boolean, prettyPrint: boolean = false): void {
        this.logger.format = winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.splat(),
            winston.format.json({ space: prettyPrint ? 2 : 0 }),
            winston.format.printf(({ level, message, timestamp, stack }) => {
                const obj: { [key: string]: any } = {
                    timestamp: timestamp,
                    level: level.toUpperCase(),
                    message: message,
                    serviceName: this.serviceName,
                };
                if (stack) {
                    obj.stack = stack;
                }
                return JSON.stringify(obj, null, prettyPrint ? 2 : 0);
            })
        );
        this.prettyPrint = prettyPrint;
    }

	public setSilent(silent: boolean): void {
		this.logger.silent = silent;
	}

	public logUnhandledErrors(): void {
		process.on("unhandledRejection", (reason, promise) => {
			this.logger.error("Unhandled Rejection at:", promise, reason);
		});

		process.on("uncaughtException", (error) => {
			this.logger.error("Uncaught Exception thrown:", error);
		});
	}

	public logStackTrace(error: Error): void {
		this.logger.error(error.stack);
	}

	public logNestedObject(obj: object, maxDepth: number = 1): void {
		const util = require("util");
		this.logger.info(util.inspect(obj, { depth: maxDepth }));
	}

	public logWithContext(
		context: string,
		level: string,
		message: string,
		meta?: object,
	): void {
		const contextLogger = this.logger.child({ context });
		contextLogger.log(level, message, {
			...meta,
			serviceName: this.serviceName,
		});
	}
}

export { LogService };
