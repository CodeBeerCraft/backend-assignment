const { Profile } = require('../../models');
const jwt = require('jsonwebtoken');
const FetchProfile = async (req, res, next) => {
  try {
    const profile_id = req.paramInt('profile_id');
    const profile = await Profile.findOne({ where: { id: profile_id } });
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
        where: {
          email,
          password: btoa(password),
        },
      },
      { transaction },
    );

    let token = null;
    if (profile != null) {
      token = jwt.sign(
        {
          id: profile != null ? profile.id : 0,
          email: email.toLowerCase(),
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
    const confirm_password = req.bodyString('confirm_password');
    const profession = req.bodyString('profession');
    const type = req.bodyString('type');
    const balance = req.bodyFloat('balance') || 0.0;

    if (password !== confirm_password || email === null) {
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
      data: profile,
    };

    await transaction.commit(); // Commit the transaction

    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    await transaction.rollback(); // Roll back the transaction in case of error
    next(error);
  }
};

module.exports = { FetchProfile, LoginWithProfile, RegisterNewProfile };
