/**
 * Email Service
 * =============
 * Nodemailer-based email service for transactional emails.
 * Currently used to notify students when their session recording is ready.
 *
 * Environment variables required:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
 *
 * Design decisions:
 * - Transporter is created lazily (first send) and reused thereafter
 * - All email functions are fire-and-forget safe — they log errors but never throw
 * - HTML emails include inline styles for maximum email client compatibility
 */

const nodemailer = require('nodemailer');

// ─── Singleton Transporter ─────────────────────────────────────────────────
let transporter = null;

/**
 * Creates and verifies the SMTP transporter on first use.
 * Returns null if SMTP credentials are not configured.
 */
function getTransporter() {
  if (transporter) return transporter;

  const host = (process.env.SMTP_HOST || '').trim();
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();

  if (!host || !user || !pass) {
    console.warn(
      '[Email Service] SMTP credentials not configured — emails will be skipped. ' +
      'Set SMTP_HOST, SMTP_USER, SMTP_PASS in your .env file.'
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    // Use TLS for port 465, STARTTLS for everything else
    secure: port === 465,
    auth: { user, pass },
    // Connection pool for better performance with multiple sends
    pool: true,
    maxConnections: 3,
  });

  // Verify connection on first creation (non-blocking)
  transporter.verify((err) => {
    if (err) {
      console.error('[Email Service] SMTP connection verification failed:', err.message);
    } else {
      console.log('[Email Service] ✅ SMTP transporter verified and ready');
    }
  });

  return transporter;
}

/**
 * Get the sender address from env or use a sensible default.
 */
function getFromAddress() {
  return (
    (process.env.EMAIL_FROM || '').trim() ||
    `"EdMarg" <${(process.env.SMTP_USER || 'noreply@edmarg.com').trim()}>`
  );
}

// ─── Recording Ready Email ─────────────────────────────────────────────────
/**
 * Sends a styled notification email to a student when their session recording
 * is ready to watch.
 *
 * @param {Object} params
 * @param {string} params.to            - Student's email address
 * @param {string} params.studentName   - Student's display name
 * @param {string} params.mentorName    - Mentor's display name
 * @param {string} params.sessionDate   - Human-readable session date
 * @param {string} params.recordingPageUrl - Full URL to the recording player page
 * @param {number} [params.durationMinutes] - Recording duration in minutes
 * @returns {Promise<boolean>} true if email was sent, false if skipped/failed
 */
async function sendRecordingReadyEmail({
  to,
  studentName,
  mentorName,
  sessionDate,
  recordingPageUrl,
  durationMinutes,
}) {
  try {
    const smtp = getTransporter();
    if (!smtp) {
      console.warn('[Email Service] Skipping recording-ready email — SMTP not configured');
      return false;
    }

    const durationText = durationMinutes
      ? `${Math.round(durationMinutes)} minutes`
      : 'your session';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f7f9fb;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f9fb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4e45e2,#6e3bd8);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                🎬 Your Recording is Ready!
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;font-size:16px;color:#2d3337;line-height:1.6;">
                Hi <strong>${studentName}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:16px;color:#2d3337;line-height:1.6;">
                Great news! The recording from your mentorship session with
                <strong style="color:#4e45e2;">${mentorName}</strong> is now available to watch.
              </p>

              <!-- Session Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0eeff;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 8px;font-size:13px;color:#68737d;text-transform:uppercase;letter-spacing:1px;font-weight:600;">
                      Session Details
                    </p>
                    <p style="margin:0 0 4px;font-size:15px;color:#2d3337;">
                      📅 <strong>Date:</strong> ${sessionDate}
                    </p>
                    <p style="margin:0 0 4px;font-size:15px;color:#2d3337;">
                      👤 <strong>Mentor:</strong> ${mentorName}
                    </p>
                    <p style="margin:0;font-size:15px;color:#2d3337;">
                      ⏱️ <strong>Duration:</strong> ${durationText}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:4px 0 16px;">
                    <a href="${recordingPageUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#4e45e2,#6e3bd8);
                              color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;
                              padding:14px 40px;border-radius:50px;
                              box-shadow:0 4px 16px rgba(78,69,226,0.3);">
                      ▶ Watch Recording
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:16px 0 0;font-size:13px;color:#68737d;line-height:1.5;text-align:center;">
                This recording is securely stored and only accessible by you and your mentor.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f7f9fb;padding:20px 40px;text-align:center;border-top:1px solid #eef2f5;">
              <p style="margin:0;font-size:12px;color:#acb3b7;">
                © ${new Date().getFullYear()} EdMarg — AI-Powered Career Mentorship
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const info = await smtp.sendMail({
      from: getFromAddress(),
      to,
      subject: `🎬 Your session recording with ${mentorName} is ready — EdMarg`,
      html,
      // Plain text fallback for email clients that don't render HTML
      text: [
        `Hi ${studentName},`,
        '',
        `Your session recording with ${mentorName} on ${sessionDate} (${durationText}) is ready!`,
        '',
        `Watch it here: ${recordingPageUrl}`,
        '',
        '— EdMarg Team',
      ].join('\n'),
    });

    console.log(`[Email Service] ✅ Recording-ready email sent to ${to} (messageId: ${info.messageId})`);
    return true;
  } catch (error) {
    // Email failure must never crash the recording pipeline
    console.error(`[Email Service] ❌ Failed to send recording-ready email to ${to}:`, error.message);
    return false;
  }
}

module.exports = {
  sendRecordingReadyEmail,
};
