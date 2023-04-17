[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/logstash-winston-3.svg)](https://badge.fury.io/js/logstash-winston-3)
[![npm downloads](https://img.shields.io/npm/dt/logstash-winston-3.svg)](https://www.npmjs.com/package/logstash-winston-3)

## Table of Contents

- [LogService 📝](#logservice-)
  - [Installation 🚀](#installation-)
  - [Usage 🤖](#usage-)
    - [Initial Configuration](#initial-configuration)
    - [Logging](#logging)
    - [Log Configuration](#log-configuration)
    - [Logging Unhandled Errors](#logging-unhandled-errors)
    - [Logging Stack Trace](#logging-stack-trace)
    - [Logging Nested Objects](#logging-nested-objects)
    - [Logging with Context](#logging-with-context)
  - [Usage with NestJS 🐝](#usage-with-nestjs-)
    - [Create a Logger Provider](#create-a-logger-provider)
    - [Inject the Logger](#inject-the-logger)
    - [Use the Logger with Context](#use-the-logger-with-context)
    - [Keep the default winston logs in the console](#keep-the-default-winston-logs-in-the-console)
  - [FAQ](#faq)
  - [Contributing](#contributing)
  - [License 📜](#license-)
  - [Author 🙋‍♀️](#author-️)

# LogService 📝

LogService is an npm package that simplifies log management for your application using the winston module. It supports sending logs to a logstash server and also provides methods for logging errors, warnings, debugging, and info messages.

## Installation 🚀

```bash
npm install --save logstash-winston-3
```

## Usage 🤖

### Initial Configuration

To use LogService, you need to create an instance of the LogService class by providing it with the required parameters.

```typescript
import { LogService } from "logstash-winston-3";

const logger = LogService.getInstance({
  serviceName: "my-app",
  logstashHost: "localhost",
  logstashPort: 5000,
});
```

### Logging

Once you have created an instance of LogService, you can use its methods to log messages. The available log levels are "error", "warn", "info", and "debug". You can also add additional data to your logs using the optional "meta" argument.

```typescript
logger.info("Hello World");
logger.error("An error occurred", { errorCode: 500 });
```

### Log Configuration

You can customize the log configuration using the following methods:

```typescript
logger.setLevel("debug"); // Changes the current log level
logger.setSilent(true); // Disables all logging
logger.setPrettyPrint(true); // Makes logs more readable
logger.setJsonStringify(true); // Enables JSON serialization of logs
```

### Logging Unhandled Errors

To log unhandled errors in your application, you can use the "logUnhandledErrors" method.

```typescript
logger.logUnhandledErrors();
```

### Logging Stack Trace

You can use the "logStackTrace" method to log the stack trace of an error.

```typescript
try {
  // code that might potentially throw an error
} catch (error) {
  logger.logStackTrace(error);
}
```

### Logging Nested Objects

To log nested objects, you can use the "logNestedObject" method. The depth of the object can also be configured using the optional "maxDepth" argument.

```typescript
const myObject = {
  name: "John",
  age: 30,
  address: {
    street: "123 Main St",
    city: "New York",
  },
};

logger.logNestedObject(myObject, 2); // logs the myObject up to 2 levels deep
```

### Logging with Context

You can use the "logWithContext" method to add context to your logs. The context is added as a property to the logged object.

```typescript
logger.logWithContext("database", "info", "Connected to database");
```

## Usage with NestJS 🐝

### Create a Logger Provider

To use LogService in your NestJS application, you can create a logger provider that will create an instance of LogService and inject it into your services.

```typescript
import { Provider } from "@nestjs/common";
import { LogService } from "logstash-winston-3";

export const LoggerProvider: Provider = {
  provide: "Logger",
  useFactory: () => {
    return LogService.getInstance({
      serviceName: "my-app",
      logstashHost: "localhost",
      logstashPort: 5000,
    });
  },
};
```

In this example, we are creating a provider named "Logger" that will create an instance of LogService using the parameters specified.

### Inject the Logger

Now that we have created a logger provider, we can inject it into our services using the "@Inject()" decorator.

```typescript
import { Injectable, Inject } from "@nestjs/common";

@Injectable()
export class MyService {
  constructor(@Inject("Logger") private readonly logger: LogService) {}

  async myMethod() {
    try {
      // some code that might throw an error
    } catch (error) {
      this.logger.error("An error occurred", { error });
      throw error;
    }
  }
}
```

In this example, we are injecting the "Logger" provider into our service and using it to log errors.

### Use the Logger with Context

You can also use the logger with context to add additional information to your logs.

```typescript
async myMethod() {
	this.logger.logWithContext('myMethod', 'info', 'Starting execution');
	try {
		// some code
		this.logger.logWithContext('myMethod', 'info', 'Execution successful');
	} catch (error) {
		this.logger.logWithContext('myMethod', 'error', 'An error occurred', { error });
		throw error;
	}
}
```

In this example, we are adding the name of the method ("myMethod") as the context for our logs. This makes it easier to trace which method generated the log message.

### Keep the default winston logs in the console

If you want to keep the default winston logs in the console, you can use the following code:

```typescript
import { Provider } from "@nestjs/common";
import { LogService } from "logstash-winston-3";

export const LoggerProvider: Provider = {
  provide: "Logger",
  useFactory: () => {
    return LogService.getInstance({
      serviceName: "my-app",
      logstashHost: "localhost",
      logstashPort: 5000,
      callback: (level: "error" | "warn" | "debug", message: string) => {
        logger[level](`${message}`);
      },
    });
  },
};
```

## FAQ

1. How can I configure LogService to send logs to Logstash?

   LogService can be configured to send logs to a Logstash server by specifying the Logstash host and port when creating an instance of LogService. You can use the `getInstance` method to create an instance of LogService with the following parameters:

   ```typescript
   const logger = LogService.getInstance({
     serviceName: "my-app",
     logstashHost: "localhost",
     logstashPort: 5000,
   });
   ```

   In this example, "my-app" is the name of the service for which logs are being collected. You should replace "localhost" with the IP address or hostname of your Logstash server, and "5000" with the port on which Logstash is listening for logs.

2. How can I add metadata to logs?

   You can add metadata to logs by passing a JSON object as the second argument to the appropriate logging method. For example:

   ```typescript
   logger.info("Info", { metadataKey: "metadataValue" });
   ```

   In this example, we have added a key-value pair to the log's metadata as a JSON object.

3. How can I customize the format of logs?

   LogService uses Winston for log management, so you can customize the format of logs using Winston's formatting options. You can use the following options:

   ```typescript
   logger.setPrettyPrint(true); // For more readable formatting
   logger.setJsonStringify(true); // For serializing logs to JSON
   ```

4. How can I configure the minimum log level?

   You can configure the minimum log level using LogService's `setLevel` method. The available log levels are "error", "warn", "info", and "debug".

   ```typescript
   logger.setLevel("debug");
   ```

   In this example, we have configured the minimum log level to "debug".

5. How can I use LogService with a framework other than NestJS?

   LogService can be used with other popular frameworks or libraries. You can create an instance of LogService with the appropriate parameters and use it to log events in your application.

6. How can I use LogService with different log transport protocols?

   LogService can be used with different log transport protocols such as syslog or fluentd using the corresponding log transport libraries. The log transport libraries can be installed via npm and imported into your application.

7. How can I troubleshoot common errors when using LogService?

   If you encounter errors when using LogService, you can check that the configuration parameters are correct and that the required libraries are installed. You can also check the server logs to detect errors and warnings that may be related to the use of LogService. If you are not sure of the cause of the error, you can consult the documentation or reach out to the LogService community for help.

## Contributing

Contributions to LogService are always welcome! If you find a bug or want to suggest a new feature, please open an issue on the GitHub repository.

If you want to contribute code, please fork the repository and create a new branch for your feature or bug fix. Once you have made your changes, create a pull request and we will review your code.

Please make sure to follow our code of conduct and our contribution guidelines when contributing to LogService. We ask that you be respectful and professional in all interactions with other contributors and maintainers.

## License 📜

LogService is distributed under the MIT license. See the [LICENSE](LICENSE) file for details.

## Author 🙋‍♀️

This package was created by [Cerfio](https://github.com/Cerfio). Please consider [starring the project](https://github.com/Cerfio/logstash-winston-3) on Github if you find it helpful! ✨
