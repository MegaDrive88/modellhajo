const { DataTypes } = require('sequelize');
const database = require('../database');

const User = database.define('User', {
    id: {type: DataTypes.INTEGER, allowNull: false, primaryKey: true},
    szerepkor_id: {type: DataTypes.INTEGER, allowNull: false},
    felhasznalonev: {type: DataTypes.STRING, allowNull: false},
    jelszo: {type: DataTypes.STRING, allowNull: false},
    megjeleno_nev: {type: DataTypes.STRING, allowNull: false},
    email: {type: DataTypes.STRING, allowNull: false},
}, {
  tableName: 't_felhasznalok',
  timestamps: false
});

module.exports = User;