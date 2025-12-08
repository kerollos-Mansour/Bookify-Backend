const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

async function connectToMongoDB() {
    try {
        await mongoose.connect(uri, {
            dbName: 'Bookify', 
        });

        console.log('Connected to MongoDB with Mongoose');


    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

module.exports = {
    connectToMongoDB,
};