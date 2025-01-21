const { Contract, Profile, Job } = require('../../models');
const { Op } = require('sequelize');

const AddBalance = async (req, res, next) => {
  const sequelize = req.app.get('sequelize');
  try {
    const profileId = req.paramInt('profileId');
    const rechargeAmount = req.bodyInt('amount');

    if (isNaN(profileId)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Bad Request : Please login again.',
        data: null,
      });
    }

    if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Bad Request : Invalid Amount',
        data: null,
      });
    }

    const aggregate = await Contract.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('Jobs.price')), 'totalPrice'], // Aggregate the total price
      ],
      where: {
        status: ['in_progress', 'new'],
        ClientId: profileId,
      },
      include: {
        required: true,
        model: Job,
        attributes: [], // No need to fetch individual prices
        where: {
          paid: {
            [Op.ne]: 1,
          },
        },
      },
      raw: true,
    });

    const total = aggregate[0]?.totalPrice || 0;
    if (total === 0) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Bad Request : You have no payable contracts.',
        data: null,
      });
    }

    const maxRecharge = total * 0.25;
    const currentBalance = await Profile.findOne({
      attributes: ['balance'],
      where: {
        id: profileId, // Updates the profile with the specific ID
      },
    }).then((res) => (res !== null ? res.balance : 0));

    if (maxRecharge >= currentBalance + rechargeAmount) {
      const flag = await sequelize.transaction(async (t) => {
        await Profile.update(
          {
            balance: currentBalance + rechargeAmount, // Only updates balance if new value is less than 400
          },
          {
            where: {
              id: profileId, // Updates the profile with the specific ID
            },
            transaction: t, // Ensures it runs within a transaction
          },
        );

        return true;
      });

      const response = {
        success: flag ? true : false,
        error: !flag ? true : false,
        message: !flag ? 'No Active Contracts found' : `Balance updated successfully.`,
        data: null,
      };
      return res.status(response.success ? 200 : 400).json(response);
    } else {
      return res.status(400).json({
        success: false,
        error: true,
        message: `Bad Request : Recharge Limit 25% is already exhausted or exceeding when recharged. Max Allowed: ${
          currentBalance - maxRecharge
        }`,
        data: null,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { AddBalance };
