const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use STARTTLS instead of SSL
  auth: {
    user: "officialsidrachain1@gmail.com",
    pass: "kkjmsyxnpdzrgwvx",
  },
  tls: {
    rejectUnauthorized: false, // Helps avoid SSL cert issues
  },
});

/**
 * Sends an alert email
 * @param {string} subject - Email subject
 * @param {string} message - Email body
 */
const sendEmailAlert = async (subject, message) => {
  const mailOptions = {
    from: '"Seed Scanner Alert" <officialsidrachain1@gmail.com>', // ✅ Same sender
    to: "officialsidrachain1@gmail.com",                         // ✅ Replace with your admin email
    subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", subject);
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
  }
};

module.exports = {
  sendEmailAlert,
};
