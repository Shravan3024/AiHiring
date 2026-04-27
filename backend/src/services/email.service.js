const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

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
  // Add pool for better performance with multiple emails
  pool: true,
  maxConnections: 5,
  maxMessages: 100
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    logger.error("❌ SMTP Connection Error:", error);
  } else {
    logger.info("✅ SMTP Server is ready to take our messages");
  }
});

/**
 * Robust email sending helper with retries
 */
const sendEmailWithRetry = async (mailOptions, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      logger.info(`✅ Email sent: ${info.messageId} (Attempt ${i + 1})`);
      return info;
    } catch (err) {
      logger.warn(`⚠️ Email attempt ${i + 1} failed: ${err.message}`);
      if (i === retries - 1) {
        logger.error(`❌ All ${retries} email attempts failed for ${mailOptions.to}`);
        throw err;
      }
      // Exponential backoff
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
};

exports.sendOTPEmail = async (to, otp) => {
  try {
    await sendEmailWithRetry({
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
    return true;
  } catch (error) {
    return false;
  }
};

exports.sendOfferLetterEmail = async (to, name, position, salary, joiningDate) => {
  try {
    await sendEmailWithRetry({
      from: `"Mask Polymers HR" <${emailUser}>`,
      to,
      subject: `Job Offer: ${position} at Mask Polymers`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding:40px;text-align:center;color:#fff;">
            <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Congratulations!</h1>
            <p style="margin:8px 0 0;opacity:0.9;font-size:16px;">We are excited to offer you a position</p>
          </div>
          <div style="padding:40px;">
            <h2 style="color:#111827;margin:0 0 20px;font-size:22px;">Hello ${name},</h2>
            <p style="color:#374151;font-size:16px;line-height:1.6;">We are thrilled to formally offer you the position of <strong>${position}</strong> at Mask Polymers.</p>
            
            <div style="background:#f9fafb;padding:24px;border-radius:12px;margin:24px 0;border:1px solid #f3f4f6;">
              <h3 style="margin:0 0 16px;font-size:12px;text-transform:uppercase;color:#6b7280;letter-spacing:1.5px;font-weight:700;">Offer Details</h3>
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 0;color:#6b7280;font-size:14px;border-bottom: 1px solid #f3f4f6;">Position:</td>
                  <td style="padding:12px 0;color:#111827;font-weight:700;text-align:right;font-size:14px;border-bottom: 1px solid #f3f4f6;">${position}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;color:#6b7280;font-size:14px;border-bottom: 1px solid #f3f4f6;">Joining Date:</td>
                  <td style="padding:12px 0;color:#111827;font-weight:700;text-align:right;font-size:14px;border-bottom: 1px solid #f3f4f6;">${new Date(joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;color:#6b7280;font-size:14px;">Annual CTC:</td>
                  <td style="padding:12px 0;color:#10b981;font-weight:700;text-align:right;font-size:14px;">₹${Number(salary).toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>

            <p style="color:#374151;font-size:15px;line-height:1.6;">Please log in to our <strong>Candidate Portal</strong> to review the full digital offer letter and comprehensive benefits package.</p>
            
            <div style="text-align:center;margin:32px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/candidate/dashboard" style="background:#10b981;color:#fff;padding:16px 32px;text-decoration:none;border-radius:10px;font-weight:700;display:inline-block;box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39);">View & Accept Offer</a>
            </div>

            <p style="color:#9ca3af;font-size:13px;text-align:center;">This offer is subject to a background verification process.</p>
            
            <p style="color:#6b7280;font-size:14px;margin-top:40px;border-top:1px solid #f3f4f6;padding-top:20px;">Best regards,<br/><strong>The Mask Polymers HR Team</strong></p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    return false;
  }
};

exports.sendRejectionEmail = async (to, name, jobTitle) => {
  try {
    await sendEmailWithRetry({
      from: `"Mask Polymers HR" <${emailUser}>`,
      to,
      subject: `Application Update - ${jobTitle} - Mask Polymers`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:32px;box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="width:48px;height:48px;background:#f3f4f6;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;color:#9ca3af;font-size:24px;">ℹ️</div>
          </div>
          <h2 style="color:#111827;font-size:18px;margin-bottom:16px;">Hello ${name},</h2>
          <p style="color:#374151;font-size:14px;line-height:1.6;margin-bottom:16px;">Thank you for your interest in the <strong>${jobTitle}</strong> position at Mask Polymers.</p>
          <p style="color:#374151;font-size:14px;line-height:1.6;margin-bottom:16px;">After carefully reviewing your application and assessment results, our team has determined that we will not be moving forward with your candidacy at this time.</p>
          <p style="color:#374151;font-size:14px;line-height:1.6;margin-bottom:24px;">We appreciate the time you took to apply and wish you the best of luck in your future endeavors.</p>
          <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0;" />
          <p style="color:#9ca3af;font-size:12px;text-align:center;">This is an automated notification from the Mask Polymers Recruitment Platform.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    return false;
  }
};

exports.sendRecommendationEmail = async (to, name, jobTitle, score) => {
  try {
    await sendEmailWithRetry({
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
    return true;
  } catch (error) {
    return false;
  }
};

exports.sendNotificationEmail = async (to, title, message, actionUrl) => {
  try {
    await sendEmailWithRetry({
      from: `"Mask Polymers" <${emailUser}>`,
      to,
      subject: `Mask Polymers: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
             <h2 style="margin: 0; font-size: 20px;">${title}</h2>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333; line-height: 1.5;">${message}</p>
            ${actionUrl ? `
            <div style="text-align: center; margin-top: 30px;">
              <a href="${actionUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">View Details</a>
            </div>` : ''}
          </div>
          <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">You received this notification because of your application with Mask Polymers.</p>
          </div>
        </div>
      `
    });
    return true;
  } catch (error) {
    return false;
  }
};
exports.sendOfferConfirmationEmail = async (to, name, decision, jobTitle, content) => {
  try {
    await sendEmailWithRetry({
      from: `"Mask Polymers" <${emailUser}>`,
      to,
      subject: `Confirmation: Offer ${decision} - ${jobTitle} - Mask Polymers`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: #fff;">
          <div style="background: ${decision === 'ACCEPTED' ? '#10b981' : '#ef4444'}; color: white; padding: 40px; text-align: center;">
             <h1 style="margin: 0; font-size: 24px;">Offer ${decision}</h1>
             <p style="margin: 8px 0 0; opacity: 0.9;">Formal confirmation for ${jobTitle}</p>
          </div>
          <div style="padding: 40px;">
            <p style="font-size: 16px; color: #1f2937;">Hello ${name},</p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
              This email serves as formal confirmation that you have <strong>${decision.toLowerCase()}</strong> the job offer for the position of <strong>${jobTitle}</strong> at Mask Polymers.
            </p>
            
            <div style="margin-top: 32px; padding: 24px; border: 1px solid #f3f4f6; border-radius: 12px; background: #f9fafb;">
               <h3 style="margin: 0 0 16px; font-size: 14px; text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Document Transcript</h3>
               <div style="font-size: 13px; color: #374151; line-height: 1.6;">
                 ${content}
               </div>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin-top: 32px;">
              ${decision === 'ACCEPTED' ? 'Our onboarding team will be in touch with you shortly to proceed with the next steps.' : 'We respect your decision and wish you the very best in your future endeavors.'}
            </p>
          </div>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Mask Polymers. All rights reserved.
          </div>
        </div>
      `
    });
    return true;
  } catch (error) {
    logger.error("Error sending offer confirmation email:", error);
    return false;
  }
};

