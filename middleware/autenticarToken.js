const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ error: 'Token mal formatado' });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
    }
}

module.exports = autenticarToken;