const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../.env' }); // Ensure dotenv is configured if loaded standalone

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this if using a different provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTP = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your SilentStress Verification Code',
            text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
            html: `<p>Your verification code is: <strong>${otp}</strong>. It will expire in 10 minutes.</p>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent to ' + email + ':', info.response);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};

module.exports = { sendOTP };
