const nodemailer = require("nodemailer");

// Use EMAIL_PASS as per .env and trim to avoid whitespace issues
const emailUser = (process.env.EMAIL_USER || "").trim();
const emailPass = (process.env.EMAIL_PASS || "").trim();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});


exports.sendOTPEmail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"Mask Polymers" <${emailUser}>`,
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
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    return false;
  }
};

exports.sendOfferLetterEmail = async (to, name, position, salary, joiningDate) => {
  try {
    await transporter.sendMail({
      from: `"Mask Polymers HR" <${emailUser}>`,
      to,
      subject: `Job Offer: ${position} at Mask Polymers`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
          <div style="background:#10b981;padding:40px;text-align:center;color:#fff;">
            <h1 style="margin:0;font-size:28px;">Congratulations!</h1>
            <p style="margin:8px 0 0;opacity:0.9;">We are excited to offer you a position</p>
          </div>
          <div style="padding:40px;">
            <h2 style="color:#111827;margin:0 0 20px;">Hello ${name},</h2>
            <p style="color:#374151;font-size:16px;line-height:1.6;">We are thrilled to formally offer you the position of <strong>${position}</strong> at Mask Polymers.</p>
            
            <div style="background:#f9fafb;padding:24px;border-radius:8px;margin:24px 0;">
              <h3 style="margin:0 0 16px;font-size:14px;text-transform:uppercase;color:#6b7280;letter-spacing:1px;">Offer Details</h3>
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0;color:#6b7280;">Position:</td>
                  <td style="padding:8px 0;color:#111827;font-weight:600;text-align:right;">${position}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;">Joining Date:</td>
                  <td style="padding:8px 0;color:#111827;font-weight:600;text-align:right;">${new Date(joiningDate).toLocaleDateString()}</td>
                </tr>
              </table>
            </div>

            <p style="color:#374151;font-size:16px;line-height:1.6;">Please log in to our candidate portal to review the full offer letter and benefits package.</p>
            
            <div style="text-align:center;margin:32px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/candidate/offers" style="background:#10b981;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;">View Full Offer</a>
            </div>

            <p style="color:#6b7280;font-size:14px;margin-top:40px;">Best regards,<br/>The Mask Polymers HR Team</p>
          </div>
        </div>
      `,
    });
    console.log("✅ Offer email sent to:", to);
    return true;
  } catch (error) {
    console.error("❌ Offer email failed:", error.message);
    return false;
  }
};

exports.sendRejectionEmail = async (to, name, jobTitle) => {
  try {
    await transporter.sendMail({
      from: `"Mask Polymers HR" <${emailUser}>`,
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
    return true;
  } catch (error) {
    console.error("❌ Rejection email failed:", error.message);
    return false;
  }
};

exports.sendRecommendationEmail = async (to, name, jobTitle, score) => {
  try {
    await transporter.sendMail({
      from: `"Mask Polymers AI" <${emailUser}>`,
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
    return true;
  } catch (error) {
    console.error("❌ Recommendation email failed:", error.message);
    return false;
  }
};

exports.sendNotificationEmail = async (to, title, message, actionUrl) => {
  try {
    await transporter.sendMail({
      from: `"Mask Polymers" <${emailUser}>`,
      to,
      subject: `Mask Polymers: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">${title}</h2>
          <p>${message}</p>
          ${actionUrl ? `<p><a href="${actionUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">View Details</a></p>` : ''}
          <hr style="border: 1px solid #ddd;">
          <p><small>You received this notification because of your application with Mask Polymers.</small></p>
        </div>
      `
    });
    console.log("✅ Notification email sent to:", to);
    return true;
  } catch (error) {
    console.error("❌ Notification email failed:", error.message);
    return false;
  }
};