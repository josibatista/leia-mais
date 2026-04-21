function checkAdmin(req, res, next) {
    if (req.usuario && req.usuario.tipo === 'admin') {
        return next();
    }
    return res.status(403).json({
        error: 'Acesso negado. Somente administradores podem realizar esta ação.'
    });
}

module.exports = checkAdmin;