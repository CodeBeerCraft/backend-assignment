const sanitizer = require('sanitize')();
const jwt = require('jsonwebtoken');
const { Profile } = require('../models');

const errorHandler = (err, req, res, next) => {
  let status = err.status ? err.status : 500;
  let message = err.message ? err.message : '';

  if (req.app.get('env') === 'development') {
    console.log(err);
  }

  if (err.message) {
    res.status(status).json({
      success: false,
      message: `${err.name} : ${message}`,
      data: [],
      error: true,
    });
  } else {
    next(err);
  }
};

const messages = {
  400: { success: false, data: null, error: 'Error', message: 'Bad Request' },
  401: {
    success: false,
    data: null,
    error: 'Error',
    message: 'Authentication Failed. Please login again',
  },
  403: {
    success: false,
    data: null,
    error: 'Error',
    message: 'You are not authorised to perform this action',
  },
  500: {
    success: false,
    data: null,
    error: 'Error',
    message: 'Something Went Wrong. Please contact the admin',
  },
};

const Authenticate = (req, res, next) => {
  try {
    const token = req.header('Authorization');
    console.log(token);

    if (!token) {
      return res.status(401).send(messages['401']);
    }

    const [type, tokenValue] = token.split(' ');

    if (type !== 'Bearer') {
      return res.status(401).send(messages['401']);
    }

    jwt.verify(tokenValue, process.env.SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).send(messages['401']);
      }

      const email = sanitizer.value(decoded.email, 'str');

      const users = await Profile.findAll({
        where: { email },
        attributes: ['type', 'id'],
      });

      if (users.length === 0) {
        return res.status(401).send(messages['401']);
      }

      const profile = users[0];

      req.params.email = sanitizer.value(email, 'str');
      req.params.profile_id = sanitizer.value(profile.id, 'int');
      req.params.type = sanitizer.value(profile.type, 'str');

      next();
    });
  } catch (error) {
    res.status(401).json(messages[401]);
  }
};

module.exports = { errorHandler, Authenticate };
