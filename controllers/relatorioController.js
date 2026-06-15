const { fn, col, literal } = require('sequelize');
const db = require('../config/db_sequelize');
const mongo = require('../config/db_mongoose');

// estatísticas gerais (números totais)
async function calcularEstatisticas() {
    const numeroLivros = await db.Livro.count();
    const numeroAutores = await db.Autor.count();
    const numeroUsuarios = await db.Usuario.count();
    const numeroTrilhas = await mongo.Trilha.countDocuments();
    const numeroObras = await mongo.Obra.countDocuments();

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
        numeroItensConcluidos
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

            res.status(200).json({ atividades: [...atividadesTrilha, ...atividadesObra, ...atividadesLivro] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar atividades recentes' });
        }
    }
};