const mongoose = require("mongoose")

const connectDatabase = async () => {
    try {

        const conn = await mongoose.connect("mongodb+srv://bkmakwana:bkm@cluster0.n05m0.mongodb.net/?retryWrites=true&w=majority", {
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