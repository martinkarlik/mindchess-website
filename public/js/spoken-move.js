const mongoose = require('mongoose');

const spokenMoveSchema = new mongoose.Schema({gt: String, signal: Buffer});
const SpokenMove = mongoose.model('SpokenMove', spokenMoveSchema);

module.exports = SpokenMove;