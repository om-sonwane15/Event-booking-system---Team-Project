// src/config/dbConnect.js
const mongoose = require("mongoose");

const dbConnect = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_DB_URL);
        console.log(`Database Connected`);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

module.exports = dbConnect;
