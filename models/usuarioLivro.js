module.exports = (sequelize, Sequelize) => {
    const UsuarioLivro = sequelize.define("UsuarioLivro", {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        usuarioId: {
            type: Sequelize.BIGINT,
            allowNull: false,
            references: { 
                model: 'Usuario', 
                key: 'id' 
            }
        },
        livroId: {
            type: Sequelize.BIGINT,
            allowNull: false,
            references: { 
                model: 'Livro', 
                key: 'id' 
            }
        },
        status: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                isIn: [['para ler', 'lendo', 'lido']]
            },
        },
        paginasLidas: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        nota: {
            type: Sequelize.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
                max: 5
            }
        }
    }, {
        tableName: 'UsuarioLivro',
        timestamps: false
    });
    return UsuarioLivro;
}
