/**
 * Dependencies Inclusions.
 */
const express = require('express');
const createError = require('http-errors');
const helmet = require('helmet');
const path = require('path');
const bodyParser = require('body-parser');

/**
 * File Inclusions : Database/Methods/Router.
 */
const { sequelize } = require('./models');
const { errorHandler } = require('./middleware');
const contractsRouter = require('./routes/contracts');
const profilesRouter = require('./routes/profiles');
const jobsRouter = require('./routes/jobs');

// Express App Initialization.
const app = express();

/**
 * Middlewares, Vunerabilites and Security Headers.
 */
app.set('sequelize', sequelize);
app.set('models', sequelize.models);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
app.use(helmet.hidePoweredBy());

/**
 * Routes Definitions.
 */
app.use('/contracts', contractsRouter);
app.use('/profiles', profilesRouter);
app.use('/jobs', jobsRouter);

/**
 * Custom Error Handler :: Ensures failure into the controllers that throws error at runtime.
 */
app.use(errorHandler);

/**
 * If reference has got till here that means unknown route is being called.
 * Catch 404 and forward to error handler
 */
app.use(async (req, res, next) => {
  next(createError(404));
});

/**
 * Final Rendering via error object with a templating engine.
 */
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development.
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page.
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
