/* eslint-disable global-require */
const cors = require('cors');
const http = require('http');
const util = require('util');
const Multer = require('multer');
const express = require('express');
const errors = require('throw.js');
const routeConfig = require('./route-config');
const errorMessages = require('./error.config.json');
const settingsConfig = require('./settings/settings-config');

const application = express();

function configureApplication(app) {
  const compression = require('compression');
  const morgan = require('morgan');

  if (settingsConfig.config.env === 'production') {
    app.use(morgan('combined'));
  } else {
    app.use(morgan('dev'));
  }
  const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024, // no larger than 50mb, you can change as needed.
    },
  });

  app.use(multer.single('file'));
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '50mb', extended: true })); // support json encoded bodies
  app.use(
    express.urlencoded({
      extended: true,
    }),
  ); // support encoded bodies

  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.type('application/json');
    next();
  });
}

function configureErrorHandler(app) {
  app.use((req, res, next) => {
    next(new errors.NotFound(errorMessages.ERR_API_NOT_FOUND));
  });
  app.use((_err, req, res) => {
    const err = _err;
    const log = settingsConfig.config.logger;
    if (err) {
      log.error(
        '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Error for Request<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      );
      log.error(`requested API : ${req.url}`);
      log.error(`method : ${req.method}`);
      log.error('request body : ');
      log.error(
        util.inspect(req.body, {
          showHidden: false,
          depth: 2,
          breakLength: Infinity,
        }),
      );
      log.error(`request Authorization  header:  ${req.get('Authorization')}`);
      log.error(
        '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Error stack<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      );
      log.error(err);
      log.error(
        '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>End of error<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      );
      if (settingsConfig.config.env === 'production') {
        // deletes the stack if it is prod or beta environment.
        // As stack is just for development purpose.
        delete err.stack;
      }
      res.status(err.statusCode || err.status || 500).json(err);
    }
  });
}

function configureRoutes(app) {
  // application.use(connect_datadog);
  routeConfig.registerRoutes(app, settingsConfig.config);
}

function startServer(app) {
  const log = settingsConfig.config.logger;

  const server = http.createServer(app);

  server.listen(settingsConfig.config.port, () => {
    log.info(
      'listening at http://%s:%s',
      settingsConfig.config.ip,
      settingsConfig.config.port,
    );
  });
}

function configureWorker(app) {
  configureApplication(app);
  configureRoutes(app);
  configureErrorHandler(app);
  startServer(app);
}

configureWorker(application);
