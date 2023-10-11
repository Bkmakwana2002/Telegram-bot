const mongoose = require("mongoose")

const connectDatabase = async () => {
    try {

        const conn = await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {

        console.log(`Error: ${error.message}`)
        process.exit()

    }
}

module.exports = connectDatabase