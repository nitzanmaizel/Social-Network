const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// @route    POST api/users
// @desc     Register User
// @access   Public

router.post('/', (req, res) => {
	console.log(req.body);
	res.send('<h1>User route</h1>');
});

module.exports = router;
