const express = require('express');
const router = express.Router();

// @route    GET api/profile
// @desc     Test route
// @access   Public
// @need     auth middleware

router.get('/', (req, res) => {
	res.send('<h1>Profile route</h1>');
});

module.exports = router;
