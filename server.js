const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

//MONGOOSE
const uri = process.env.MONGODB_URI;
mongoose.connect(uri).then((con) => {
  console.log('----------------------------------');
  console.log('DB connection successfull 🔥!');
});

// SERVER
const port = 4000;
app.listen(port, () => {
  console.log('----------------------------------');
  console.log(`App running on port:${port}`);
});
