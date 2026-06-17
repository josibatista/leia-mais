const { fn, col, literal } = require('sequelize');
const db = require('../config/db_sequelize');
const mongo = require('../config/db_mongoose');

// Total de páginas lidas — mesma regra do perfil do leitor (perfilLeitor.js)
async function calcularPaginasLidas() {
    const vinculos = await db.UsuarioLivro.findAll({
        where: {
            status: { [db.Sequelize.Op.in]: ['lido', 'lendo'] }
        },
        include: [{
            model: db.Livro,
            as: 'livro',
            attributes: ['id', 'paginas']
        }]
    });

    let total = 0;
    const livrosLidosPorUsuario = new Set();

    for (const vinculo of vinculos) {
        if (vinculo.status === 'lido') {
            total += Number(vinculo.livro?.paginas) || 0;
            livrosLidosPorUsuario.add(`${vinculo.usuarioId}-${vinculo.livroId}`);
        } else if (vinculo.status === 'lendo') {
            total += Number(vinculo.paginasLidas) || 0;
        }
    }

    const concluidosTrilha = await mongo.TrilhaUsuarioLivro.find({ concluida: true }).lean();

    if (concluidosTrilha.length > 0) {
        const livroIds = [...new Set(concluidosTrilha.map((item) => item.livroId))];
        const livros = await db.Livro.findAll({
            where: { id: livroIds },
            attributes: ['id', 'paginas']
        });
        const paginasPorLivro = new Map(
            livros.map((livro) => [livro.id.toString(), Number(livro.paginas) || 0])
        );

        for (const item of concluidosTrilha) {
            const chave = `${item.usuarioId}-${item.livroId}`;
            if (livrosLidosPorUsuario.has(chave)) {
                continue;
            }
            total += paginasPorLivro.get(String(item.livroId)) || 0;
        }
    }

    return total;
}

// estatísticas gerais (números totais)
async function calcularEstatisticas() {
    const numeroLivros = await db.Livro.count();
    const numeroAutores = await db.Autor.count();
    const numeroUsuarios = await db.Usuario.count();
    const numeroTrilhas = await mongo.Trilha.countDocuments();
    const numeroObras = await mongo.Obra.countDocuments();
    const paginasLidas = await calcularPaginasLidas();

    const numeroLeituras = await db.UsuarioLivro.count({ where: { status: 'lido' } });

    const obrasConcluidas = await mongo.TrilhaUsuarioObra.countDocuments({ concluida: true });
    const livrosConcluidos = await mongo.TrilhaUsuarioLivro.countDocuments({ concluida: true });
    const numeroItensConcluidos = obrasConcluidas + livrosConcluidos;

    return {
        numeroLivros,
        numeroAutores,
        numeroLeituras,
        numeroUsuarios,
        numeroTrilhas,
        numeroObras,
        numeroItensConcluidos,
        paginasLidas
    };
}

// busca atividades recentes de trilhas 
async function buscarAtividadesTrilha(limite = 5) {
    const trilhas = await mongo.Trilha.find()
        .sort({ dataHora: -1 })
        .limit(limite);

    return trilhas.map(t => ({
        tipo: 'trilha',
        descricao: `Trilha cadastrada: ${t.tema}`,
        liberada: t.liberada,
        data: t.dataHora
    }));
}

async function calcularTrilhasPopulares(limite = 3) {
    const ranking = await mongo.TrilhaUsuario.aggregate([
        { $group: { _id: '$trilhaId', total: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: limite }
    ]);

    const trilhaIds = ranking.map(r => r._id);
    const trilhas = await mongo.Trilha.find({ _id: { $in: trilhaIds } });
    const trilhasMap = Object.fromEntries(trilhas.map(t => [t._id.toString(), t.tema]));

    return ranking.map(r => ({
        trilhaId: r._id,
        tema: trilhasMap[r._id.toString()] || 'Trilha removida',
        totalUsuarios: r.total
    }));
}

async function calcularGenerosPopulares(limite = 3) {
    const resultado = await db.UsuarioLivro.findAll({
        attributes: [
            [col('livro.genero'), 'genero'],
            [fn('COUNT', col('UsuarioLivro.id')), 'total']
        ],
        include: [{
            model: db.Livro,
            as: 'livro',
            attributes: []
        }],
        where: { status: 'lido' },
        group: ['livro.genero'],
        order: [[fn('COUNT', col('UsuarioLivro.id')), 'DESC']],
        limit: limite,
        raw: true
    });

    return resultado.map(r => ({
        genero: r.genero,
        total: Number(r.total)
    }));
}

async function calcularMaiorAbandono() {
    const resultado = await db.UsuarioLivro.findAll({
        attributes: [
            [col('livro.genero'), 'genero'],
            'status',
            [fn('COUNT', col('UsuarioLivro.id')), 'total']
        ],
        include: [{
            model: db.Livro,
            as: 'livro',
            attributes: []
        }],
        group: ['livro.genero', 'status'],
        raw: true
    });

    // agrupa por gênero: total geral e total "para ler"
    const porGenero = {};
    resultado.forEach(r => {
        if (!porGenero[r.genero]) {
            porGenero[r.genero] = { total: 0, paraLer: 0 };
        }
        porGenero[r.genero].total += Number(r.total);
        if (r.status === 'para ler') {
            porGenero[r.genero].paraLer += Number(r.total);
        }
    });

    // calcula proporção de abandono por gênero
    let maiorAbandono = null;
    let maiorProporcao = -1;

    for (const [genero, dados] of Object.entries(porGenero)) {
        const proporcao = dados.total > 0 ? dados.paraLer / dados.total : 0;
        if (proporcao > maiorProporcao) {
            maiorProporcao = proporcao;
            maiorAbandono = genero;
        }
    }

    return {
        genero: maiorAbandono,
        proporcao: maiorProporcao
    };
}

// busca atividades recentes de obras
async function buscarAtividadesObra(limite = 5) {
    const obras = await mongo.Obra.find()
        .sort({ dataHora: -1 })
        .limit(limite);

    return obras.map(o => ({
        tipo: 'obra',
        descricao: `Obra cadastrada: ${o.titulo}`,
        data: o.dataHora
    }));
}

// busca atividades recentes de livros
async function buscarAtividadesLivro(limite = 5) {
    const livros = await db.Livro.findAll({
        order: [['id', 'DESC']],
        limit: limite
    });

    return livros.map(l => ({
        tipo: 'livro',
        descricao: `Livro cadastrado: ${l.titulo}`,
        imagemCapa: l.imagemCapa,
        paginas: l.paginas
    }));
}

// busca ativiades recentes de autores
async function buscarAtividadesAutor(limite = 5) {
    const autores = await db.Autor.findAll({
        order: [['id', 'DESC']],
        limit: limite
    });

    return autores.map(a => ({
        tipo: 'autor',
        descricao: `Autor cadastrado: ${a.nome}`,
    }));
}

// métricas para gráficos do dashboard
async function calcularMetricas() {
    // cadastros de usuários por mês
    const cadastrosPorMes = await db.Usuario.findAll({
        attributes: [
            [fn('to_char', col('dataCriacao'), 'YYYY-MM'), 'mes'],
            [fn('COUNT', col('id')), 'total']
        ],
        group: [literal('mes')],
        order: [[literal('mes'), 'ASC']],
        raw: true
    });

    // distribuição de usuários por tipo
    const distribuicaoUsuarios = await db.Usuario.findAll({
        attributes: ['tipo', [fn('COUNT', col('id')), 'total']],
        group: ['tipo'],
        raw: true
    });

    // distribuição do status de leitura dos livros
    const distribuicaoStatusLeitura = await db.UsuarioLivro.findAll({
        attributes: ['status', [fn('COUNT', col('id')), 'total']],
        group: ['status'],
        raw: true
    });

    // distribuição do status das trilhas dos usuários
    const trilhasUsuario = await mongo.TrilhaUsuario.find({}, 'status');
    const distribuicaoStatusTrilha = trilhasUsuario.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
    }, {});

    return {
        cadastrosPorMes,
        distribuicaoUsuarios,
        distribuicaoStatusLeitura,
        distribuicaoStatusTrilha
    };
}

module.exports = {
    // estatísticas gerais
    async getRelatorio(req, res) {
        try {
            const estatisticas = await calcularEstatisticas();
            res.status(200).json(estatisticas);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao gerar relatório' });
        }
    },

    // métricas para gráficos
    async getMetricas(req, res) {
        try {
            const metricas = await calcularMetricas();
            res.status(200).json(metricas);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao gerar métricas' });
        }
    },

    // salva snapshot das estatísticas
    async postRelatorio(req, res) {
        try {
            const estatisticas = await calcularEstatisticas();
            const relatorio = await mongo.Relatorio.create(estatisticas);

            res.status(201).json({
                message: 'Relatório salvo com sucesso',
                relatorio
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao salvar relatório' });
        }
    },

    // histórico de snapshots
    async getRelatorios(req, res) {
        try {
            const relatorios = await mongo.Relatorio.find().sort({ _id: -1 });
            res.status(200).json({ relatorios });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao consultar relatórios' });
        }
    },
    async getRelatorioCSV(req, res) {
        try {
            const estatisticas = await calcularEstatisticas();

            const cabecalho = Object.keys(estatisticas).join(';');

            const valores = Object.values(estatisticas).join(';');

            const csv = `${cabecalho}\n${valores}`;

            res.setHeader(
                'Content-Type',
                'text/csv'
            );

            res.setHeader(
                'Content-Disposition',
                'attachment; filename=relatorio.csv'
            );

            res.send(csv);

        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: 'Erro ao gerar CSV'
            });
        }
    },
    async exportarCSV(req, res) {
        try {

            const estatisticas = await calcularEstatisticas();

            const campos = req.body.campos || [];

            const dadosFiltrados = {};

            campos.forEach(campo => {
                if (estatisticas[campo] !== undefined) {
                    dadosFiltrados[campo] = estatisticas[campo];
                }
            });

            const cabecalho =
                Object.keys(dadosFiltrados).join(';');

            const valores =
                Object.values(dadosFiltrados).join(';');

            const csv =
                `${cabecalho}\n${valores}`;

            res.setHeader(
                'Content-Type',
                'text/csv'
            );

            res.setHeader(
                'Content-Disposition',
                'attachment; filename=relatorio.csv'
            );

            res.send(csv);

        } catch (error) {
            console.error(error);

            res.status(500).json({
                error: 'Erro ao gerar CSV'
            });
        }
    },
    async getAtividadesRecentes(req, res) {
        try {
            const limite = Number(req.query.limite) || 5;
            const atividadesTrilha = await buscarAtividadesTrilha(limite);
            const atividadesObra = await buscarAtividadesObra(limite);
            const atividadesLivro = await buscarAtividadesLivro(limite);
            const atividadesAutor = await buscarAtividadesAutor(limite);

            res.status(200).json({ atividades: [...atividadesTrilha, ...atividadesObra, ...atividadesLivro, ...atividadesAutor] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar atividades recentes' });
        }
    },
    async getDashboard(req, res) {
        try {
            const [trilhasPopulares, generosPopulares, maiorAbandono] = await Promise.all([
                calcularTrilhasPopulares(3),
                calcularGenerosPopulares(3),
                calcularMaiorAbandono()
            ]);

            res.status(200).json({
                trilhasPopulares,
                generosPopulares,
                maiorAbandono
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao gerar dashboard' });
        }
    },
};