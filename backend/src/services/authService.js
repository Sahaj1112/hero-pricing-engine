const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/authRepository');
const { jwtSecret } = require('../config/env');
const AppError = require('../utils/AppError');

class AuthService {
    login(username, password) {
        const user = authRepository.findByCredentials(username, password);

        if (!user) {
            throw new AppError('Invalid username or password', 401);
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            jwtSecret,
            { expiresIn: '8h' }
        );

        return {
            token,
            user: { id: user.id, username: user.username, role: user.role },
        };
    }
}

module.exports = new AuthService();
