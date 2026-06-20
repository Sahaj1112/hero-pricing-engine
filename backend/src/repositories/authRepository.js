const USERS = require('../config/users');

class AuthRepository {
    findByCredentials(username, password) {
        return USERS.find(
            (u) => u.username === username && u.password === password
        ) || null;
    }
}

module.exports = new AuthRepository();
