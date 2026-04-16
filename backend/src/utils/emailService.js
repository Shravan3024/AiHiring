const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = async (to, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[MOCK EMAIL] To: ${to}, OTP: ${otp}`);
    return;
  }
  await transporter.sendMail({
    from: `"Mask Polymers HR" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify Your Email - Mask Polymers",
    html: `
      <h3>Email Verification</h3>
      <p>Your OTP is:</p>
      <h2>${otp}</h2>
      <p>This OTP expires in 10 minutes.</p>
    `
  });
};

const sendEmail = async ({ to, subject, template, data }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}, Template: ${template}, Data:`, data);
    return;
  }
  // Simplified for now
  await transporter.sendMail({
    from: `"Mask Polymers HR" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `<h3>${subject}</h3><p>Template: ${template}</p><pre>${JSON.stringify(data, null, 2)}</pre>`
  });
};

module.exports = { sendOTPEmail, sendEmail };