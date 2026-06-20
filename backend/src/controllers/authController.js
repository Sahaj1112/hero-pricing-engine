const authService = require('../services/authService');

class AuthController {
    login(req, res) {
        const { username, password } = req.body;
        const result = authService.login(username, password);
        res.json(result);
    }
}

module.exports = new AuthController();
