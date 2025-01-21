const { Contract, Profile, Job } = require('../../models');
const { Op, Sequelize } = require('sequelize');
const moment = require('moment');

const Fetchjobs = async (req, res, next) => {
  try {
    const profileId = req.paramInt('profileId');
    if (isNaN(profileId)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Bad Request : Please login again.',
        data: null,
      });
    }

    const contract = await Contract.findAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt'], // Exclude these fields
      },
      where: {
        status: {
          [Op.not]: 'terminated',
        },
        [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }],
      },
      include: {
        required: true,
        model: Job,
        attributes: {
          exclude: ['createdAt', 'updatedAt'], // Exclude these fields
        },
        where: {
          [Op.or]: [{ paid: null }, { paid: 0 }],
        },
      },
    });

    const response = {
      success: contract.length ? true : false,
      error: contract.length === 0 ? true : false,
      message: contract.length === 0 ? 'No Jobs found for you' : `${contract.length} Jobs found`,
      data: contract,
    };

    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    next(error);
  }
};

const PayForJob = async (req, res, next) => {
  try {
    const sequelize = req.app.get('sequelize');
    const profileId = req.paramInt('profileId');
    const job_id = req.paramInt('job_id');

    if (isNaN(profileId)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Bad Request : Please login again.',
        data: null,
      });
    }

    if (isNaN(job_id)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Bad Request : Invalid Job id',
        data: null,
      });
    }

    const contract = await Contract.findOne({
      attributes: ['id', 'status', 'ContractorId', 'ClientId'],
      where: {
        status: 'in_progress',
        ClientId: profileId,
      },
      raw: true,
      include: {
        required: true,
        model: Job,
        attributes: ['id', 'price', 'paid', 'ContractId'],
        where: {
          id: job_id,
        },
      },
    });

    if (contract === null) {
      const response = {
        success: contract !== null ? true : false,
        error: contract === null ? true : false,
        message: contract === null ? 'No Active Job found' : `Contracts found`,
        data: contract,
      };
      return res.status(response.success ? 200 : 400).json(response);
    }

    if (contract['Jobs.paid'] === 1) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Job already paid',
        data: null,
      });
    }

    const profile = await Profile.findByPk(profileId);
    if (profile.balance < contract['Jobs.price']) {
      return res.status(400).json({
        success: false,
        error: true,
        message: `Insufficient balance : ${profile.balance}`,
        data: null,
      });
    }

    /**
     * Transfer the balance.
     * TODO: Create a real payment gateway transaction before below operation for real world scenario.
     */
    const flag = await sequelize.transaction(async (t) => {
      await Profile.update(
        { balance: sequelize.literal(`balance - ${contract['Jobs.price']}`) },
        { where: { id: profileId }, transaction: t },
      );
      await Profile.update(
        { balance: sequelize.literal(`balance + ${contract['Jobs.price']}`) },
        { where: { id: contract.ContractorId }, transaction: t },
      );
      await Job.update(
        { paid: 1, paymentDate: moment().toISOString() },
        { where: { id: job_id }, transaction: t },
      );
      await Contract.update(
        { status: 'terminated' },
        { where: { id: contract['Jobs.ContractId'] }, transaction: t },
      );

      return true;
    });

    return res.status(flag ? 200 : 400).json({
      success: flag ? true : false,
      error: !flag ? true : false,
      message: flag ? 'Payment successful' : 'Payment failed',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { Fetchjobs, PayForJob };
