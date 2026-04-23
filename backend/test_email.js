require('dotenv').config();
const nodemailer = require('nodemailer');

async function test() {
  const emailUser = (process.env.EMAIL_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || "").trim();

  console.log("Testing with:");
  console.log("USER:", emailUser);
  console.log("PASS length:", emailPass.length);
  
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use SSL
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ Credentials are valid.");
  } catch (err) {
    console.error("❌ Invalid credentials:", err.message);
  }
}

test();
