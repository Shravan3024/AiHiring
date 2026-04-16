const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTPEmail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"Mask Polymers" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Mask Polymers verification code",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#f9fafb;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:#2563eb;padding:28px 32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:-0.5px;">Mask Polymers</h1>
            <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px;">AI-Powered Recruitment Platform</p>
          </div>
          <div style="padding:32px;">
            <h2 style="margin:0 0 8px;color:#111827;font-size:18px;">Verify your email address</h2>
            <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">Use the code below to complete your registration. It expires in <strong>10 minutes</strong>.</p>
            <div style="background:#eff6ff;border:2px dashed #2563eb;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px;">
              <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#1d4ed8;font-family:monospace;">${otp}</span>
            </div>
            <p style="color:#9ca3af;font-size:12px;margin:0;">If you didn't create an account, you can safely ignore this email.</p>
          </div>
          <div style="background:#f3f4f6;padding:16px 32px;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} Mask Polymers. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    console.log("✅ OTP email sent to:", to);

  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error("Email service failed. Check Gmail app password.");
  }
};

exports.sendRejectionEmail = async (to, name, jobTitle) => {
  try {
    await transporter.sendMail({
      from: `"Mask Polymers HR" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Application Update - ${jobTitle} - Mask Polymers`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:32px;">
          <h2 style="color:#111827;font-size:18px;">Hello ${name},</h2>
          <p style="color:#374151;font-size:14px;line-height:1.5;">Thank you for your interest in the <strong>${jobTitle}</strong> position at Mask Polymers.</p>
          <p style="color:#374151;font-size:14px;line-height:1.5;">After carefully reviewing your application and assessment results, our AI system has determined that we will not be moving forward with your candidacy at this time.</p>
          <p style="color:#374151;font-size:14px;line-height:1.5;">We appreciate the time you took to apply and wish you the best of luck in your future endeavors.</p>
          <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0;" />
          <p style="color:#9ca3af;font-size:12px;">This is an automated notification from the Mask Polymers Recruitment Platform.</p>
        </div>
      `,
    });
    console.log("✅ Rejection email sent to:", to);
  } catch (error) {
    console.error("❌ Rejection email failed:", error.message);
  }
};

exports.sendRecommendationEmail = async (to, name, jobTitle, score) => {
  try {
    await transporter.sendMail({
      from: `"Mask Polymers AI" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Excellent News! Next Steps for ${jobTitle}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:32px;">
          <h2 style="color:#111827;font-size:18px;">Hello ${name},</h2>
          <p style="color:#374151;font-size:14px;line-height:1.5;">Congratulations! Your application for the <strong>${jobTitle}</strong> position has been flagged as <strong>Strongly Recommended</strong> by our AI evaluation system with a score of ${score}/100.</p>
          <p style="color:#374151;font-size:14px;line-height:1.5;">Our HR team will be in touch with you shortly to discuss the next steps in the hiring process.</p>
          <p style="color:#374151;font-size:14px;line-height:1.5;">Best regards,<br/>The Mask Polymers Recruitment Team</p>
        </div>
      `,
    });
    console.log("✅ Recommendation email sent to:", to);
  } catch (error) {
    console.error("❌ Recommendation email failed:", error.message);
  }
};