const express = require('express');
const router = express.Router();

// IMPORTATION DU CONTROLLER
const UsersController = require('../controllers/users.controller');
const verifieToken = require('../middlewares/auth');

router.post('/register', UsersController.register);
router.post('/sign', UsersController.sign);
router.get('/all', verifieToken, UsersController.get_all_users)

module.exports = router;