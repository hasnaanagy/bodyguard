const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const app = require('./app');
const DBAtlas = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
const DBLocal = process.env.DATABASE_LOCAL;
mongoose
  .connect(DBAtlas, {})
  .then(() => {
    console.log('DB connection successful! 🧶 ');
  })
  .catch((err) => {
    console.error('DB connection error:', err);
  });

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});
