/* eslint-disable global-require */
const cors = require('cors');
const http = require('http');
const util = require('util');
const Multer = require('multer');
const express = require('express');
const errors = require('throw.js');
const compression = require('compression');
const morgan = require('morgan');
const routeConfig = require('./route-config');
const errorMessages = require('./error.config.json');
const settingsConfig = require('./settings/settings-config');
const mongoDBConnection = require('../middleware/database');
const notFound = require('../middleware/not-found');

const application = express();

const configureApplication = (app) => {
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

  app.use(express.static(join(__dirname, "./app/public")));

  app.use(multer.single('file'));
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '50mb' })); // support json encoded bodies
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
};

const configureErrorHandler = (app) => {
  const log = settingsConfig.config.logger;
  
  app.use(notFound);
  
  app.use((err, req, res, next) => {
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
      '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>End of error<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
    );
    next(new errors.NotFound(errorMessages.ERR_API_NOT_FOUND));
  });
};

const configureRoutes = (app) => {
  // application.use(connect_datadog);
  routeConfig.registerRoutes(app, settingsConfig.config);
};

const connectDB = () => {
  const log = settingsConfig.config.logger;

  return new Promise((resolve, reject) => {
    return mongoDBConnection.connect()
    .then(() => {
      log.info('DB Connection Established Successfully');
      resolve('Success')
    })
    .catch((error) => {
      log.error(`Error while establishing DB connection : ${error}`);
      reject(error);
    });
  })
}

const startServer = (app) => {
  const log = settingsConfig.config.logger;

  const server = http.createServer(app);

  server.listen(settingsConfig.config.port, () => {
    log.info(
      'listening at http://%s:%s',
      settingsConfig.config.ip,
      settingsConfig.config.port,
    );
  });
};

const configureWorker = async (app) => {
  const log = settingsConfig.config.logger;

  await configureApplication(app);
  await configureRoutes(app);
  await configureErrorHandler(app);
  connectDB().then(function () {
    startServer(app);
  })
  .catch(function (error) {
    log.error(`Error : ${error}`);
  });
};

configureWorker(application);
