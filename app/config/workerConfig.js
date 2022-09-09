// const util = require('util');
const cors = require('cors');
const Multer = require('multer');
const express = require('express');
// const errors = require('throw.js');
const compression = require('compression');
const morgan = require('morgan');

const application = express();

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

const startServer = (app) => {
  // TODO :: Use port from setting config ...
  const port = 5000;
  app.listen(port, () => {
    console.log(`Listening on port :: ${port}`);
  });

  app.on('error', (error) => {
    console.error(`Error in starting server on port ${port} :: ${error}`);
  });
};

const configureWorker = (app) => {
  configureApplication(app);
  // configureRoutes(app);
  // configureErrorHandler(app);
  startServer(app);
};

configureWorker(application);
