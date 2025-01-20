const { Contract } = require('../../models');

const FetchContractById = async (req, res, next) => {
  try {
    const contract_id = req.paramInt('contract_id');
    const contract = await Contract.findOne({ where: { id: contract_id } });
    const response = {
      success: contract != null ? true : false,
      error: contract == null ? true : false,
      message: contract == null ? 'Contract not found' : 'Contract found',
      data: contract,
    };

    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = { FetchContractById };
