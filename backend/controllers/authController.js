const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTP } = require('../services/emailService');

// Helper to generate 6 digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        user = new User({
            name,
            email,
            passwordHash: hashedPassword,
            otp,
            otpExpiresAt,
            isVerified: false
        });

        await user.save();

        // Send email
        const emailSent = await sendOTP(email, otp);
        if (!emailSent) {
            return res.status(500).json({ msg: 'Error sending OTP email, but user created' });
        }

        res.json({ msg: 'Registration successful! Please check your email for the OTP.', email: user.email });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // If we reach here, credentials match. Issue token directly.
        const payload = {
            user: { id: user.id }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            // Return success even if not found to prevent email enumeration
            return res.json({ msg: 'If an account with that email exists, an OTP was sent.' });
        }

        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        user.otp = otp;
        user.otpExpiresAt = otpExpiresAt;
        await user.save();

        const emailSent = await sendOTP(email, otp);
        if (!emailSent) {
            return res.status(500).json({ msg: 'Error sending OTP email, please try again later.' });
        }

        res.json({ msg: 'If an account with that email exists, an OTP was sent.', email: user.email });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid request' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        if (user.otpExpiresAt < new Date()) {
            return res.status(400).json({ msg: 'OTP has expired' });
        }

        // Validate new password briefly
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.passwordHash = hashedPassword;
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        // Optionally, immediately log them in
        const payload = {
            user: { id: user.id }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ msg: 'Password reset successfully', token, user: { id: user.id, name: user.name, email: user.email } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid Verify OTP' });
        }

        if (user.otpExpiresAt < new Date()) {
            return res.status(400).json({ msg: 'OTP has expired' });
        }

        // OTP valid, clear it
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        user.isVerified = true;
        await user.save();

        const payload = {
            user: { id: user.id }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
