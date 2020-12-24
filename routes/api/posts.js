const express = require('express');
const router = express.Router();

// @route    GET api/posts
// @desc     Test route
// @access   Public
// @need     auth middleware

router.get('/', (req, res) => {
	res.send('<h1>Posts route</h1>');
});

module.exports = router;
