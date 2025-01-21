const { Contract, Profile, Job } = require('../../models');
const { Op } = require('sequelize');

const FetchContractById = async (req, res, next) => {
  try {
    const profileId = req.paramInt('profileId');
    const contractId = req.paramInt('id');

    if (isNaN(profileId) || isNaN(contractId)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Bad Request : Invalid profileId or contractId',
        data: null,
      });
    }

    const contract = await Contract.findOne({
      attributes: {
        exclude: ['createdAt', 'updatedAt'], // Exclude these fields
      },
      where: {
        id: contractId,
        [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }], // ! Bit Skeptical about which user should be able to fetch the contract so added for both role.
      },
      include: {
        model: Job,
        attributes: {
          exclude: ['createdAt', 'updatedAt'], // Exclude these fields
        },
      },
    });

    const response = {
      success: contract != null ? true : false,
      error: contract == null ? true : false,
      message:
        contract == null ? "Contract not found or it doesn't belongs to you" : 'Contract found',
      data: contract,
    };

    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    next(error);
  }
};

const FetchContracts = async (req, res, next) => {
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
        model: Job,
        attributes: {
          exclude: ['createdAt', 'updatedAt'], // Exclude these fields
        },
      },
    });

    const response = {
      success: contract.length ? true : false,
      error: contract.length === 0 ? true : false,
      message:
        contract.length === 0 ? 'No Contracts found for you' : `${contract.length} Contracts found`,
      data: contract,
    };

    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    next(error);
  }
};

const CreateContracts = async (req, res, next) => {
  const sequelize = req.app.get('sequelize');
  const transaction = await sequelize.transaction(); // Start a new transaction

  try {
    const clientId = req.paramInt('profileId');
    const contractorId = req.bodyInt('contractorId');
    const price = req.bodyInt('price');
    const terms = req.bodyString('terms') || '';
    const description = req.bodyString('description') || '';

    if (
      isNaN(clientId) ||
      isNaN(contractorId) ||
      terms.length === 0 ||
      description.length === 0 ||
      isNaN(price) ||
      price <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Bad Request : Contract Data Missing',
        data: null,
      });
    }

    const profile = await Profile.findOne({ where: { id: contractorId, type: 'contractor' } });

    if (clientId === contractorId || profile === null) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Bad Request : Invalid Profiles selected.',
        data: null,
      });
    }

    const payload = {
      ClientId: clientId,
      ContractorId: contractorId,
      terms,
      status: 'new',
    };

    const contractId = await Contract.create(payload, { transaction })
      .then((res) => res.id)
      .catch((err) => 0);

    const response = {
      success: contractId ? true : false,
      error: contractId === 0 ? true : false,
      message: contractId === 0 ? 'Contracts creation failed' : 'Contracts created',
      data: [],
    };

    await Job.create(
      {
        description,
        price,
        ContractId: contractId,
        paid: false,
      },
      { transaction },
    );

    await transaction.commit(); // Commit the transaction
    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    await transaction.rollback(); // Roll back the transaction in case of error
    next(error);
  }
};

const StartJob = async (req, res, next) => {
  try {
    const profileId = req.paramInt('profileId');
    const contractId = req.paramInt('contractId');

    if (isNaN(profileId) || isNaN(contractId)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Bad Request : Invalid profileId or contractId',
        data: null,
      });
    }

    const contract = await Contract.findOne({
      where: {
        id: contractId,
        ContractorId: profileId,
        status: 'new',
      },
    });

    if (contract === null) {
      return res.status(400).json({
        success: false,
        error: true,
        message:
          'Bad Request : Contract not found or it does not belongs to you or already started',
        data: null,
      });
    }

    contract.status = 'in_progress';
    await contract.save();

    return res.status(200).json({
      success: true,
      error: false,
      message: 'Contract started',
      data: contract,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { FetchContractById, FetchContracts, CreateContracts, StartJob };
