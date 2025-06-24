const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const app = require('./app');
const DBAtlas = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
const DBLocal = process.env.DATABASE_LOCAL;
const port = process.env.PORT || 8000;

mongoose
  .connect(DBAtlas)
  .then(() => {
    console.log('DB connection successful! 🧶 ');
    app.listen(port, () => {
      console.log(`app running on port ${port}...`);
    });
  })
  .catch((err) => {
    console.error('DB connection error:', err);
  });
