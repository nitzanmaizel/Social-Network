const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
	// Get token from header
	const token = req.header('x-auth-token');

	// Check if not token ==> 401 - not authorized
	if (!token) {
		return res.status(401).json({ msg: 'No token, authorization denied' });
	}

	// Verify token ==>
	try {
		// decoded the token ==>
		const decoded = jwt.verify(token, config.get('jwtSecret'));

		// set the decoded token to the req.user ==>
		req.user = decoded.user; // we can use that req.user in any of out routes
		next();
	} catch (e) {
		res.status(401).json({ msg: 'Token is not valid' });
	}
};
