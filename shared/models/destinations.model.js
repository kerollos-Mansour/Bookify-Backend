const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: true,
    },
    categoryId:{
        // remmber to connect it 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        // required: true,
    },
    bestSeller:{
        type: Boolean,
        default: false,
    },
    rating:{
        type: Number,
        default: 0,
    },
    address:{
        type: String,
        // required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
    updatedAt:{
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Destination = mongoose.model('Destination', destinationSchema);

module.exports = Destination;