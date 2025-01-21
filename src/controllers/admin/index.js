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
    const limit = parseInt(req.queryString('limit'), 10) || 10; // Default limit to 10
    const offset = parseInt(req.queryString('offset'), 10) || 0; // Default offset to 0

    if (!startDate || !endDate || !isValidDate(startDate) || !isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Bad Request: Invalid Dates.',
        data: null,
      });
    }

    const result = await Profile.findAll({
      attributes: [
        'id',
        'firstName',
        'lastName',
        [
          Sequelize.literal(`(
            SELECT SUM(Jobs.price)
            FROM Contracts AS Client
            INNER JOIN Jobs
            ON Client.id = Jobs.ContractId
            WHERE
              Client.ClientId = Profile.id
              AND Jobs.paid = 1
              AND Jobs.paymentDate BETWEEN '${startDate}' AND '${endDate}'
          )`),
          'totalPaid',
        ],
      ],
      where: {
        type: 'client',
      },
      order: [[Sequelize.literal('totalPaid'), 'DESC']],
      limit,
      offset,
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
