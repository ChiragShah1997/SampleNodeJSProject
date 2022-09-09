const util = require('util');
const cors = require('cors');
const Multer = require('multer');
const express = require('express');
const errors = require('throw.js');
const compression = require('compression');
const morgan = require('morgan');
const errorMessages = require('./error.config.json');
const settingsConfig = require('./settings/settings-config');
const routeConfig = require('./route-config');

const application = express();
const logger = settingsConfig.config.logger;

const env = process.env.NODE_ENV || 'development';

const configureApplication = (app) => {
  if (env === 'production') {
    app.use(morgan('combined'));
  } else {
    app.use(morgan('dev'));
  }

  const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024, // no larger than 50mb, you can change as needed ...
    },
  });

  app.use(multer.single('file'));
  app.use(cors);
  app.use(compression());
  app.use(
    express.json({
      limit: '50mb',
    }),
  );
  app.use(
    express.urlencoded({
      extended: true,
    }),
  );
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.type('application/json');
    next();
  });
};

const configureRoutes = (app) => {
  routeConfig.registerRoutes(app, settingsConfig.config);
};

const configureErrorHandler = (app) => {
  app.use((req, res, next) => {
    next(new errors.NotFound(errorMessages.ERR_API_NOT_FOUND));
  });
  app.use((err, req, res) => {
    if (err) {
      logger.error(
        '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Error for Request<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      );
      logger.error(`requested API : ${req.url}`);
      logger.error(`method : ${req.method}`);
      logger.error('request body : ');
      logger.error(
        util.inspect(req.body, {
          showHidden: false,
          depth: 2,
          breakLength: Infinity,
        }),
      );
      logger.error(
        `request Authorization  header:  ${req.get('Authorization')}`,
      );
      logger.error(
        '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Error stack<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      );
      logger.error(err);
      logger.error(
        '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>End of error<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      );
      if (env === 'production') {
        // deletes the stack if it is production environment ...
        // As stack is just for development purpose ...
        delete err.stack;
      }
      return res.status(err.statusCode || err.status || 500).json(err);
    }
  });
};

const startServer = (app) => {
  const port = settingsConfig.config.port;
  app.listen(port, () => {
    logger.info(`Listening on port :: ${port}`);
  });

  app.on('error', (error) => {
    logger.error(`Error in starting server on port ${port} :: ${error}`);
  });
};

const configureWorker = (app) => {
  configureApplication(app);
  configureRoutes(app);
  configureErrorHandler(app);
  startServer(app);
};

configureWorker(application);
