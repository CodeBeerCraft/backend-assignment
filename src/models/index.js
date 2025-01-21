const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite3',
  logging: false,
});

class Profile extends Sequelize.Model {}
Profile.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    profession: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    balance: {
      type: Sequelize.DECIMAL(12, 2),
    },
    type: {
      type: Sequelize.STRING, // Changing since SQLite does not support ENUM.
      allowNull: false,
      validate: {
        isIn: {
          args: [['client', 'contractor', 'admin']], // Allowed values
          msg: 'Type must be either client or contractor.', // Custom error message for validation
        },
      },
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Profile',
    indexes: [
      {
        unique: true,
        fields: ['email', 'type'], // Composite unique constraint
      },
    ],
  },
);

class Contract extends Sequelize.Model {}
Contract.init(
  {
    terms: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM('new', 'in_progress', 'terminated'),
    },
  },
  {
    sequelize,
    modelName: 'Contract',
  },
);

class Job extends Sequelize.Model {}
Job.init(
  {
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    price: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },
    paid: {
      type: Sequelize.BOOLEAN,
      default: false,
    },
    paymentDate: {
      type: Sequelize.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Job',
  },
);

Profile.hasMany(Contract, { as: 'Contractor', foreignKey: 'ContractorId' });
Contract.belongsTo(Profile, { as: 'Contractor' });
Profile.hasMany(Contract, { as: 'Client', foreignKey: 'ClientId' });
Contract.belongsTo(Profile, { as: 'Client' });
Contract.hasMany(Job);
Job.belongsTo(Contract);

module.exports = {
  sequelize,
  Profile,
  Contract,
  Job,
};
