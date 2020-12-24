const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const config = require('config');

// @route    GET api/auth
// @desc     Test route
// @access   Public

router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch (e) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public

router.post(
	'/',
	[
		check('email', 'Email is invalid').isEmail(),
		check('password', 'Password is required').exists(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			// See if the User exists ==>
			let user = await User.findOne({ email });

			if (!user) {
				return res.status(400).json({ errors: [{ msg: 'Invalid Credential' }] });
			}

			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch) {
				return res.status(400).json({ errors: [{ msg: 'Invalid Credential' }] });
			}

			const payload = {
				user: {
					id: user.id,
				},
			};

			jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 3600 }, (err, token) => {
				if (err) {
					throw err;
				}
				res.json({ token });
			});
		} catch (e) {
			console.log(e.message);
			res.status(500).send('Server error');
		}
	}
);

module.exports = router;
