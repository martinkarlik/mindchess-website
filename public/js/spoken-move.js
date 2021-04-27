const mongoose = require('mongoose');

const spokenMoveSchema = new mongoose.Schema({gt: String, signal: Array});
const SpokenMove = mongoose.model('SpokenMove', spokenMoveSchema);

module.exports = SpokenMove;