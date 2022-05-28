const mongoose = require('mongoose')
const balance_schema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	userId: String,
	guildId: String,
	amount: { type: Number, default: 1000},
});

module.exports = mongoose.model('Balance', balance_schema, 'balances');