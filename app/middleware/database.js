const mongoose = require('mongoose');
const connect = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    const connection = await mongoose.connect('mongodb://root:password@mongo:27017/my-db?authSource=admin', options);
    if (connection) {
      console.log("Database Connected Successfully...");
    }
  } catch (error) {
    console.log("Error while connecting database\n");
    console.log(error);
  }
}

module.exports = {
  connect,
};