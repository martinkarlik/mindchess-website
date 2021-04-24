const mongoose = require('mongoose');
const SpokenMove = require('spoken-move')

mongoose.connect('mongodb://localhost:27017/mindChess', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("Connection open!")
    })
    .catch(() => {
        console.log("Connection rejected!")
    })