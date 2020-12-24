const express = require('express');
const router = express.Router();

// @route    GET api/auth
// @desc     Test route
// @access   Public
// @need     auth middleware

router.get('/', (req, res) => {
	res.send('<h1>Auth route</h1>');
});

module.exports = router;
