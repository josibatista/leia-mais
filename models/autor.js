module.exports = (sequelize, Sequelize) => {
    const Autor = sequelize.define("Autor", {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        biografia: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        nome: {
            type: Sequelize.TEXT,
            allowNull: false
        }
    }, {
        tableName: 'Autor',
        timestamos: false
    });
    return Autor;
}
