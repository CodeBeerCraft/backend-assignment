const { Contract, Profile, Job } = require('../../models');
const { Op, Sequelize } = require('sequelize');
const { isValidDate } = require('../../utils');

const FetchBestProfession = async (req, res, next) => {
  try {
    const startDate = req.queryString('start');
    const endDate = req.queryString('end');

    if (isValidDate(startDate) === false || isValidDate(endDate) === false) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Bad Request : Invalid Dates.',
        data: null,
      });
    }

    const result = await Profile.findAll({
      attributes: [
        'id',
        'firstName',
        'lastName',
        'profession',
        [Sequelize.fn('SUM', Sequelize.col('Contractor->Jobs.price')), 'totalPaid'],
      ],
      where: {
        type: 'contractor',
      },
      include: [
        {
          model: Contract,
          as: 'Contractor', // Use the alias defined in the association
          attributes: [],
          required: true,
          where: { status: 'terminated' },
          include: [
            {
              model: Job,
              attributes: [],
              where: {
                paid: true,
                paymentDate: {
                  [Op.between]: [startDate, endDate],
                },
              },
            },
          ],
        },
      ],
      group: ['Profile.profession'],
      order: [[Sequelize.literal('totalPaid'), 'DESC']],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      error: false,
      message: 'Search Attempt Successful.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const FetchBestClients = async (req, res, next) => {
  try {
    const startDate = req.queryString('start');
    const endDate = req.queryString('end');

    if (
      startDate.length === 0 ||
      endDate.length === 0 ||
      isValidDate(startDate) === false ||
      isValidDate(endDate) === false
    ) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Bad Request : Invalid Dates.',
        data: null,
      });
    }

    const result = await Profile.findAll({
      attributes: [
        'id',
        'firstName',
        'lastName',
        [Sequelize.fn('SUM', Sequelize.col('Client->Jobs.price')), 'totalPaid'],
      ],
      where: {
        type: 'client',
      },
      include: [
        {
          model: Contract,
          as: 'Client', // Use the alias defined in the association
          attributes: [],
          required: true,
          where: { status: 'terminated' },
          include: [
            {
              model: Job,
              attributes: [],
              where: {
                paid: true,
                paymentDate: {
                  [Op.between]: [startDate, endDate],
                },
              },
            },
          ],
        },
      ],
      group: ['Profile.id'],
      order: [[Sequelize.literal('totalPaid'), 'DESC']],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      error: false,
      message: 'Search Attempt Successful.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { FetchBestProfession, FetchBestClients };
