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
        dataCriacao: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
            field: 'data_criacao'
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
            allowNull: true,
            field: 'imagem_perfil'
        },
        xp: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        tableName: 'Usuario',
        timestamps: false
    });
    return Usuario;
}