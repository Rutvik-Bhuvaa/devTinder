const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose.connect("mongo_connection_string");
};

module.exports = connectDB;
