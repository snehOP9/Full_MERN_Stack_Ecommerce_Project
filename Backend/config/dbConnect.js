const { default: mongoose } = require("mongoose");

const dbConnect = async () => {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Database Connected Successfully");
};
module.exports = dbConnect;
