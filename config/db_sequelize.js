const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Livro = require('../models/livro')(sequelize, Sequelize);
db.Autor = require('../models/autor')(sequelize, Sequelize);
db.LivroAutor = require('../models/livroAutor')(sequelize, Sequelize);
db.UsuarioLivro = require('../models/usuarioLivro')(sequelize, Sequelize);
db.Usuario = require('../models/usuario')(sequelize, Sequelize);

db.Livro.belongsToMany(
  db.Autor, { 
    through: db.LivroAutor, 
    foreignKey: 'livroId',
    as: 'autores'
  }
);
db.Autor.belongsToMany(
  db.Livro, {
     through: db.LivroAutor,
     foreignKey: 'autorId' ,
      as: 'livros'
  }
);

db.Usuario.belongsToMany(
    db.Livro, {
        through: db.UsuarioLivro,
        foreignKey: 'usuarioId',
        as: 'livros'
    }
);
db.Livro.belongsToMany(
    db.Usuario, {
        through: db.UsuarioLivro,
        foreignKey: 'livroId',
        as: 'usuarios'
    }
);

module.exports = db;