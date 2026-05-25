module.exports = (sequelize, Sequelize) => {
    const LivroAutor = sequelize.define("LivroAutor", {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        livroId: {
            type: Sequelize.BIGINT,
            allowNull: false,
            references: { 
                model: 'Livro', 
                key: 'id' 
            }
        },
        autorId: {
            type: Sequelize.BIGINT,
            allowNull: false,
            references: { 
                model: 'Autor', 
                key: 'id' 
            }
        }
    }, {
        tableName: 'LivroAutor',
        timestamps: false
    });
    return LivroAutor;
}
