require('dotenv').config();
const app = require('./app');
const { PORT } = process.env;
const init = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Express App Listening on Port ${PORT}`);
    });
  } catch (error) {
    console.error(`An error occurred: ${JSON.stringify(error)}`);
    process.exit(1);
  }
};

init();
