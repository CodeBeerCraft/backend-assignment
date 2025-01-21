const { Profile } = require('../../models');
const jwt = require('jsonwebtoken');
const FetchProfile = async (req, res, next) => {
  try {
    const profileId = req.paramInt('profileId');
    const profile = await Profile.findOne({
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt'], // Exclude these fields
      },
      where: { id: profileId },
    });
    const response = {
      success: profile != null ? true : false,
      error: profile == null ? true : false,
      message: profile == null ? 'Profile not found' : 'Profile found',
      data: profile,
    };

    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    next(error);
  }
};

const LoginWithProfile = async (req, res, next) => {
  const sequelize = req.app.get('sequelize');
  const transaction = await sequelize.transaction(); // Start a new transaction
  try {
    const email = req.bodyEmail('email');
    const password = req.bodyString('password');
    const type = req.bodyString('type');

    if (password.length === 0 || email === null) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Bad Request : Invalid inputs',
        data: null,
      });
    }

    const profile = await Profile.findOne(
      {
        attributes: ['id', 'email', 'type'],
        where: {
          email,
          password: btoa(password),
          type,
        },
      },
      { transaction },
    );

    let token = null;
    if (profile != null) {
      token = jwt.sign(
        {
          id: profile != null ? profile.id : 0,
          email: profile.email.toLowerCase(),
          type: profile.type.toLowerCase(),
        },
        process.env.SECRET,
        { expiresIn: '6h' },
      );
    }

    const response = {
      success: profile != null ? true : false,
      error: profile == null ? true : false,
      message: profile == null ? 'Profile Not Found' : 'Profile Found',
      data: { token },
    };

    await transaction.commit(); // Commit the transaction

    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    await transaction.rollback(); // Roll back the transaction in case of error
    next(error);
  }
};

const RegisterNewProfile = async (req, res, next) => {
  const sequelize = req.app.get('sequelize');
  const transaction = await sequelize.transaction(); // Start a new transaction

  try {
    const email = req.bodyEmail('email');
    const firstName = req.bodyString('firstName');
    const lastName = req.bodyString('lastName');
    const password = req.bodyString('password');
    const confirmPassword = req.bodyString('confirmPassword');
    const profession = req.bodyString('profession');
    const type = req.bodyString('type');
    const balance = req.bodyFloat('balance') || 0.0;

    if (password !== confirmPassword || email === null) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Bad Request : Invalid inputs',
        data: null,
      });
    }

    const profile = await Profile.create(
      {
        email,
        firstName,
        lastName,
        password: btoa(password),
        profession,
        type,
        balance,
      },
      { transaction },
    );

    const response = {
      success: profile !== null ? true : false,
      error: profile === null ? true : false,
      message: profile === null ? 'Profile registeration failed' : 'Profile got registered',
      data: null,
    };

    await transaction.commit(); // Commit the transaction

    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    await transaction.rollback(); // Roll back the transaction in case of error
    if (error.name === 'SequelizeUniqueConstraintError') {
      next(new Error('A profile with this email and type already exists.'));
    } else {
      next(error);
    }
  }
};

module.exports = { FetchProfile, LoginWithProfile, RegisterNewProfile };
