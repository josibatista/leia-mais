module.exports = (sequelize, Sequelize) => {
    const Usuario = sequelize.define("usuario", {
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
        data_criacao: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        tipo: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                isIn: [['admin', 'usuario']]
            }
        },
        imagemPerfil: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        xp: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: 0
        }
    });
    return Usuario;
}