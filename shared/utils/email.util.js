const transporter = require("../config/email.config");
const appError = require("../utils/appError.utils");


const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new appError("Failed to send email", 500);
    }
};

module.exports = sendEmail;
