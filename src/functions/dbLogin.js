const Sequelize = require('sequelize');

module.exports = (client) => {
	client.dbLogin = async () => {
		const sequelize = new Sequelize('database', 'user', 'password', {
			host: 'localhost',
			dialect: 'sqlite',
			logging: false,
			storage: 'database.sqlite'
		})
		const overall_ldb = sequelize.define('skillless-bwldb-overall', {
			ign: Sequelize.STRING,
			uuid: Sequelize.STRING,
			winstreak: Sequelize.INTEGER,
		});
		const solos_ldb = sequelize.define('skillless-bwldb-solos', {
			ign: Sequelize.STRING,
			uuid: Sequelize.STRING,
			winstreak: Sequelize.INTEGER,
		});
		const doubles_ldb = sequelize.define('skillless-bwldb-doubles', {
			ign: Sequelize.STRING,
			uuid: Sequelize.STRING,
			winstreak: Sequelize.INTEGER,
		});
		const threes_ldb = sequelize.define('skillless-bwldb-threes', {
			ign: Sequelize.STRING,
			uuid: Sequelize.STRING,
			winstreak: Sequelize.INTEGER,
		});
		const fours_ldb = sequelize.define('skillless-bwldb-fours', {
			ign: Sequelize.STRING,
			uuid: Sequelize.STRING,
			winstreak: Sequelize.INTEGER,
		});
		const fourVsFour_ldb = sequelize.define('skillless-bwldb-4v4', {
			ign: Sequelize.STRING,
			uuid: Sequelize.STRING,
			winstreak: Sequelize.INTEGER,
		});
		overall_ldb.sync();
		solos_ldb.sync();
		doubles_ldb.sync();
		threes_ldb.sync();
		fours_ldb.sync();
		fourVsFour_ldb.sync();
	};
};