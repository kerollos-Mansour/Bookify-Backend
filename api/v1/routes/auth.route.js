const express = require('express');
const router = express.Router();
const { register,login } = require('../controller/auth.controller');

// post new destination
router.post('/register', register);
router.post('/login', login)
// router.get('/:id', getUserById)
// router.delete('/:id', deleteUser)
// router.put('/:id', updateUser)


module.exports = router;