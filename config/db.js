const mongoose = require('mongoose')
const colors = require('colors')

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log(`Connected to DB ${mongoose.connection.host}`.bgCyan.white)
    } catch(error) {
        console.log(`error in connecting to DB ${error}`.bgRed.white)
    }
}

module.exports = connectDB;