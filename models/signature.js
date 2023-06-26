const {Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://root@localhost/dbttd');
const user = require('./users')
const document = require('./documents')
const signature = sequelize.define('signature', 
{
    user_id: {
        type:DataTypes.INTEGER, 
        allowNull: false,
        primaryKey: true,
        references:{
            model: user,
            key: 'id'
        }
    },
    document_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        references:{
            model: document,
            key: 'id'
        }
    }, 
    pdfNew:{
        type:DataTypes.STRING,
        allowNull: true
    },
    id_penerima: {
        type:DataTypes.INTEGER,
        allowNull:false 
    },
    jabatan: {
        type:DataTypes.STRING,
        allowNull: false
    },
    status: {
        type:DataTypes.STRING,
        allowNull: false
    },
    signed_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    created_at:{
        type:DataTypes.DATE,
      
    }, 
    updated_at: {
        type:DataTypes.DATE
    }
}, 
{
    tableName: 'signature',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

user.hasMany(signature, {
    foreignKey: 'user_id',
    sourceKey: 'id'
})
document.hasMany(signature, {
    foreignKey: 'document_id',
    sourceKey: 'id'
})

module.exports = signature