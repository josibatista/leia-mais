module.exports = (sequelize, Sequelize) => {
    const Livro = sequelize.define("Livro", {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        titulo: {
            type: Sequelize.TEXT,
            allowNull: false,
            unique: true
        },
        descricao: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        anoPublicacao: {
            type: Sequelize.BIGINT,
            allowNull: true
        },
        genero: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        imagemCapa: {
            type: Sequelize.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'Livro',
        timestamps: false
    });
    return Livro;
}
