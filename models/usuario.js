module.exports = (sequelize, Sequelize) => {
    const Usuario = sequelize.define("Usuario", {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        nome: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        email: {
            type: Sequelize.TEXT,
            allowNull: false,
            unique: true
        },
        senha: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        dataCriacao: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
        tipo: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                isIn: [['administrador', 'usuario']]
            }
        },
        iconePerfil: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        //xp: {
        //    type: Sequelize.BIGINT,
        //    allowNull: false,
        //    defaultValue: 0
        //},
        username: {
            type: Sequelize.TEXT,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'Usuario',
        timestamps: false
    });
    return Usuario;
}