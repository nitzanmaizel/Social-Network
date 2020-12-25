const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route    GET api/profile/me
// @desc     Get current user profile
// @access   private
// @need     auth middleware

router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id }).populate('user', [
			'name',
			'avatar',
		]);

		if (!profile) {
			return res.status(400).json({ msg: 'There is no profile for this user' });
		}

		res.json(profile);
	} catch (e) {
		console.error(e.massage);
		res.status(500).send('Server Error');
	}
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   private
// @need     auth middleware

router.post('/', [
	auth,
	[
		check('status', 'Status is required').not().isEmpty(),
		check('skills', 'Skills is required').not().isEmpty(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			company,
			website,
			location,
			bio,
			status,
			githubusername,
			skills,
			twitter,
			linkedin,
			instagram,
			facebook,
			youtube,
		} = req.body;

		// Build profile OBJ ==>
		const profileFields = {};
		profileFields.user = req.user.id;
		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (githubusername) profileFields.githubusername = githubusername;

		// Convert string to array and remove spaces if excites ==>
		if (skills) profileFields.skills = skills.split(',').map((skill) => skill.trim());

		// Build social OBJ ==>
		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (twitter) profileFields.social.twitter = twitter;
		if (facebook) profileFields.social.facebook = facebook;
		if (linkedin) profileFields.social.linkedin = linkedin;
		if (instagram) profileFields.social.instagram = instagram;

		try {
			// every time we use mongoose method we need to add `-await-` ==>
			let profile = await Profile.findOne({ user: req.user.id });

			if (profile) {
				//If we have a profile we want to Update ==>
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				);

				return res.json(profile);
			}

			// If don't have a profile we want to Create new ==>
			profile = new Profile(profileFields);
			await profile.save();
			res.json(profile);
		} catch (e) {
			console.error(e.message);
			res.status(500).send('Server Error');
		}
	},
]);

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public

router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', ['name', 'avatar']);
		res.json(profiles);
	} catch (e) {
		console.error(e.massage);
		res.status(500).send('Server Error');
	}
});

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get('/user/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', [
			'name',
			'avatar',
		]);
		if (!profile) {
			return res.status(400).json({ msg: 'Profile not found ' });
		}
		res.json(profile);
	} catch (e) {
		console.error(e.massage);
		if (e.kind == 'ObjectId') {
			return res.status(400).json({ msg: 'Profile not found ' });
		}
		res.status(500).send('Server Error');
	}
});

// @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   privet
// @need     auth middleware

router.delete('/', auth, async (req, res) => {
	try {
		// Remove Profile
		await Profile.findOneAndRemove({ user: req.user.id });
		// Remove User
		await User.findOneAndRemove({ _id: req.user.id });
		res.json({ msg: 'User deleted' });
	} catch (e) {
		console.error(e.massage);
		res.status(500).send('Server Error');
	}
});

// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   privet
// @need     auth middleware

router.put(
	'/experience',
	[
		auth,
		[
			check('title', 'Title is required').not().isEmpty(),
			check('company', 'Company is required').not().isEmpty(),
			check('from', 'Form date is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { title, company, location, from, to, current, description } = req.body;

		const newExperience = {
			title,
			company,
			location,
			from,
			to,
			current,
			description,
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });
			profile.experience.unshift(newExperience);
			await profile.save();
			res.json(profile);
		} catch (e) {
			console.error(e.massage);
			res.status(500).send('Server Error');
		}
	}
);

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete a experience
// @access   privet
// @need     auth middleware

router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });
		// Get remove index ==>
		const removeIndex = profile.experience.map((item) => item.id).indexOf(req.params.exp_id);

		profile.experience.splice(removeIndex, 1);
		await profile.save();
		res.json(profile);
	} catch (e) {
		console.error(e.massage);
		res.status(500).send('Server Error');
	}
});

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   privet
// @need     auth middleware

router.put(
	'/education',
	[
		auth,
		[
			check('school', 'School is required').not().isEmpty(),
			check('degree', 'Degree is required').not().isEmpty(),
			check('fieldofstudy', 'Form date is required').not().isEmpty(),
			check('from', 'Form date is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { school, degree, fieldofstudy, from, to, current, description } = req.body;

		const newEducation = {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description,
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });
			profile.education.unshift(newEducation);
			await profile.save();
			res.json(profile);
		} catch (e) {
			console.error(e.massage);
			res.status(500).send('Server Error');
		}
	}
);

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete a education
// @access   privet
// @need     auth middleware

router.delete('/education/:edu_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });
		// Get remove index ==>
		const removeIndex = profile.education.map((item) => item.id).indexOf(req.params.edu_id);
		profile.education.splice(removeIndex, 1);
		await profile.save();
		res.json(profile);
	} catch (e) {
		console.error(e.massage);
		res.status(500).send('Server Error');
	}
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   public

router.get('/github/:username', async (req, res) => {
	try {
		const options = {
			uri: `https://api.github.com/users/${
				req.params.username
			}/repos?per_page=5&sort=created:asc&client_id=${config.get(
				'githubClientID'
			)}&client_secret=${config.get('githubSecret')}`,
			method: 'GET',
			headers: { 'user-agent': 'node.js' },
		};

		request(options, (error, response, body) => {
			if (error) console.error(error);

			if (response.statusCode !== 200) {
				res.status(404).json({ msg: 'No Github profile found' });
			}

			res.json(JSON.parse(body));
		});
	} catch (e) {
		console.error(e.massage);
		res.status(500).send('Server Error');
	}
});
module.exports = router;
