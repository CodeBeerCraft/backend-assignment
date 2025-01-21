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
      const type = sanitizer.value(decoded.type, 'str');

      const profile = await Profile.findOne({
        where: { email, type },
        attributes: ['type', 'id'],
      });

      if (profile === null) {
        return res.status(401).send(messages['401']);
      }

      req.params.email = sanitizer.value(email, 'str');
      req.params.profileId = sanitizer.value(profile.id, 'int');
      req.params.type = sanitizer.value(profile.type, 'str');

      next();
    });
  } catch (error) {
    res.status(401).json(messages[401]);
  }
};

const Rbac = (type) => {
  return async (req, res, next) => {
    try {
      const profileType = req.paramString('type');
      if (profileType === type) {
        next();
      } else {
        return res.status(403).json(messages[403]);
      }
    } catch (error) {
      return res.status(403).json(messages[403]);
    }
  };
};

module.exports = { errorHandler, Authenticate, Rbac };
