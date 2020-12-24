const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const config = require('config');
const User = require('../../models/User');

// @route    POST api/users
// @desc     Register User
// @access   Public

router.post(
	'/',
	[
		check('name', 'Name is required').not().isEmpty(),
		check('email', 'Email is invalid').isEmail(),
		check('password', 'Password must be greater than 6 characters').isLength({ min: 6 }),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body;

		try {
			// See if the User exists ==>
			let user = await User.findOne({ email });
			if (user) {
				return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
			}

			// Get users gravatar ==>
			const avatar = gravatar.url(email, {
				s: '200', // Size
				r: 'pg', // rating
				d: 'mm', // default
			});

			user = new User({
				name,
				email,
				avatar,
				password,
			});

			// Encrypt password ==>
			const salt = await bcrypt.genSalt(10);

			user.password = await bcrypt.hash(password, salt);

			// Save the User ==>
			await user.save();

			// 2. check post req ==>
			// res.send('User registered');

			//Return jsonwebtoken ==>

			const payload = {
				user: {
					id: user.id,
				},
			};

			jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
				if (err) {
					throw err;
				}
				res.json({ token });
			});
		} catch (e) {
			console.log(e.message);
			res.status(500).send('Server error');
		}

		// 1.
		// console.log(req.body);
		// res.send('<h1>User route</h1>');
	}
);

module.exports = router;
