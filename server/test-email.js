const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

console.log("Testing Email Credentials...");
console.log("User:", process.env.EMAIL_USER);
// console.log("Pass:", process.env.EMAIL_PASS); // Security: don't log pass

transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to self
    subject: 'Test Email',
    text: 'If you see this, email is working!'
}, (err, info) => {
    if (err) {
        console.error("FAILED to send email:");
        console.error(err);
    } else {
        console.log("Email sent successfully!");
        console.log(info);
    }
});
