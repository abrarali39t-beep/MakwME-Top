// ═══════════════════════════════════════════════════════════════
//  MBP – MakeMeTop Business Profile
//  Google Apps Script — Email Handler + Image Upload
//  Deploy as: Web App → Execute as ME → Anyone can access
//  Paste this entire file into script.google.com
// ═══════════════════════════════════════════════════════════════

// ── CONFIG — change these ──
const ADMIN_EMAIL = 'abrarrtallks@gmail.com';
const BRAND_NAME  = 'MBP – MakeMeTop Business Profile';
const SITE_URL    = 'https://makemetop.in';
const DRIVE_FOLDER_NAME = 'MBP_Uploads'; // Google Drive folder for images

// ═══════════════════════════════════════════════════════════════
//  MAIN ENTRY POINT — handles all POST requests from the web app
// ═══════════════════════════════════════════════════════════════
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Route based on action field
    switch (data.action) {

      case 'sendWelcomeEmail':
        return sendWelcomeEmail(data.to, data.name);

      case 'sendBusinessApproved':
        return sendBusinessApprovedEmail(data.to, data.name, data.businessName);

      case 'sendBusinessRejected':
        return sendBusinessRejectedEmail(data.to, data.name, data.businessName);

      case 'sendNewReviewAlert':
        return sendNewReviewAlert(data.businessOwnerEmail, data.businessName, data.reviewerName, data.rating);

      default:
        // Legacy: image upload (no action field = file upload)
        return uploadImageToDrive(data.file, data.name, data.folder);
    }

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ═══════════════════════════════════════════════════════════════
//  1. IMAGE UPLOAD TO GOOGLE DRIVE
// ═══════════════════════════════════════════════════════════════
function uploadImageToDrive(base64Data, fileName, folderName) {
  const folder = getOrCreateFolder(folderName || DRIVE_FOLDER_NAME);
  const blob = Utilities.newBlob(
    Utilities.base64Decode(base64Data),
    'image/webp',
    fileName || ('mbp_' + Date.now() + '.webp')
  );
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const fileId = file.getId();
  const url = 'https://drive.google.com/uc?export=view&id=' + fileId;
  return ContentService
    .createTextOutput(JSON.stringify({ url: url, id: fileId }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateFolder(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

// ═══════════════════════════════════════════════════════════════
//  2. WELCOME EMAIL — sent on first login
// ═══════════════════════════════════════════════════════════════
function sendWelcomeEmail(toEmail, userName) {
  if (!toEmail) return jsonResponse({ status: 'skipped', reason: 'no email' });

  const subject = '🔥 Welcome to MBP – MakeMeTop Business Profile!';
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr><td style="background:#1F1F1F;padding:28px 32px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-1px;">
            Make<span style="color:#F5A623;">Me</span>Top
          </div>
          <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:4px;">MBP – MakeMeTop Business Profile</div>
        </td></tr>

        <!-- HERO -->
        <tr><td style="padding:32px 32px 16px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">🔥</div>
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1F1F1F;">
            Welcome, ${userName}!
          </h1>
          <p style="margin:0;font-size:15px;color:#6B7280;line-height:1.6;">
            You're now part of <strong>Srinagar's #1 local business directory</strong> for Jammu &amp; Kashmir.
          </p>
        </td></tr>

        <!-- DIVIDER -->
        <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #E5E7EB;"/></td></tr>

        <!-- FEATURES -->
        <tr><td style="padding:24px 32px;">
          <p style="font-weight:700;font-size:15px;color:#1F1F1F;margin:0 0 16px;">Here's what you can do on MBP:</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="40" style="vertical-align:top;padding-bottom:14px;font-size:20px;">📋</td>
              <td style="padding-bottom:14px;">
                <strong style="color:#1F1F1F;">Create Your MBP</strong><br/>
                <span style="color:#6B7280;font-size:13px;">Free MakeMeTop Business Profile — ranked on Google Search in Srinagar &amp; J&amp;K</span>
              </td>
            </tr>
            <tr>
              <td width="40" style="vertical-align:top;padding-bottom:14px;font-size:20px;">⭐</td>
              <td style="padding-bottom:14px;">
                <strong style="color:#1F1F1F;">Write 5-Star Reviews</strong><br/>
                <span style="color:#6B7280;font-size:13px;">Help great businesses in Kashmir get discovered</span>
              </td>
            </tr>
            <tr>
              <td width="40" style="vertical-align:top;padding-bottom:14px;font-size:20px;">🔍</td>
              <td style="padding-bottom:14px;">
                <strong style="color:#1F1F1F;">Discover Local Businesses</strong><br/>
                <span style="color:#6B7280;font-size:13px;">Find top-rated restaurants, shops, doctors &amp; services across J&amp;K</span>
              </td>
            </tr>
            <tr>
              <td width="40" style="vertical-align:top;font-size:20px;">📲</td>
              <td>
                <strong style="color:#1F1F1F;">Install the MBP App</strong><br/>
                <span style="color:#6B7280;font-size:13px;">Go to Settings → Download App — works offline too!</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:8px 32px 32px;text-align:center;">
          <a href="${SITE_URL}" style="display:inline-block;background:#1F1F1F;color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:15px;">
            🔥 Create My MBP Now
          </a>
          <p style="margin:16px 0 0;font-size:12px;color:#9CA3AF;">
            Your MBP gets ranked on Google with your business name, address, phone &amp; reviews — completely free!
          </p>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background:#F9FAFB;padding:20px 32px;text-align:center;border-top:1px solid #E5E7EB;">
          <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.6;">
            <strong style="color:#6B7280;">MBP – MakeMeTop Business Profile</strong><br/>
            Srinagar, Jammu &amp; Kashmir, India<br/>
            <a href="${SITE_URL}" style="color:#F5A623;text-decoration:none;">makemetop.in</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  GmailApp.sendEmail(toEmail, subject, '', { htmlBody: html, name: BRAND_NAME, replyTo: ADMIN_EMAIL });
  return jsonResponse({ status: 'sent', to: toEmail });
}

// ═══════════════════════════════════════════════════════════════
//  3. BUSINESS APPROVED EMAIL
// ═══════════════════════════════════════════════════════════════
function sendBusinessApprovedEmail(toEmail, userName, businessName) {
  if (!toEmail) return jsonResponse({ status: 'skipped' });

  const subject = `✅ Your MBP is Live – ${businessName}`;
  const html = `
<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:#1F1F1F;padding:24px 32px;text-align:center;">
          <div style="font-size:24px;font-weight:900;color:#fff;">Make<span style="color:#F5A623;">Me</span>Top</div>
        </td></tr>
        <tr><td style="padding:32px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">🎉</div>
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1F1F1F;">Your MBP is Live!</h1>
          <p style="color:#6B7280;font-size:15px;line-height:1.6;">
            Hi ${userName}, your MakeMeTop Business Profile for <strong style="color:#1F1F1F;">${businessName}</strong> is now approved and live on Google Search!
          </p>
          <div style="background:#D1FAE5;border:1px solid #6EE7B7;border-radius:10px;padding:16px;margin:20px 0;text-align:left;">
            <strong style="color:#065F46;">✅ Your MBP is now:</strong>
            <ul style="color:#065F46;font-size:13px;margin:8px 0 0;padding-left:18px;line-height:1.8;">
              <li>Indexed on Google Search for Srinagar &amp; J&amp;K</li>
              <li>Showing your name, address, phone &amp; reviews</li>
              <li>Ready to receive customer calls &amp; messages</li>
            </ul>
          </div>
          <a href="${SITE_URL}" style="display:inline-block;background:#16A34A;color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:15px;">
            View My MBP 🔥
          </a>
        </td></tr>
        <tr><td style="background:#F9FAFB;padding:16px 32px;text-align:center;border-top:1px solid #E5E7EB;">
          <p style="margin:0;font-size:12px;color:#9CA3AF;">MBP – MakeMeTop Business Profile · Srinagar, J&amp;K · <a href="${SITE_URL}" style="color:#F5A623;">makemetop.in</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  GmailApp.sendEmail(toEmail, subject, '', { htmlBody: html, name: BRAND_NAME, replyTo: ADMIN_EMAIL });
  return jsonResponse({ status: 'sent' });
}

// ═══════════════════════════════════════════════════════════════
//  4. BUSINESS REJECTED EMAIL
// ═══════════════════════════════════════════════════════════════
function sendBusinessRejectedEmail(toEmail, userName, businessName) {
  if (!toEmail) return jsonResponse({ status: 'skipped' });

  const subject = `ℹ️ MBP Update – ${businessName} needs changes`;
  const html = `
<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:#1F1F1F;padding:24px 32px;text-align:center;">
          <div style="font-size:24px;font-weight:900;color:#fff;">Make<span style="color:#F5A623;">Me</span>Top</div>
        </td></tr>
        <tr><td style="padding:32px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">📝</div>
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1F1F1F;">MBP Needs Changes</h1>
          <p style="color:#6B7280;font-size:15px;line-height:1.6;">
            Hi ${userName}, your MBP for <strong style="color:#1F1F1F;">${businessName}</strong> needs a few updates before it can go live.
          </p>
          <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:10px;padding:16px;margin:20px 0;text-align:left;">
            <strong style="color:#92400E;">Common reasons:</strong>
            <ul style="color:#92400E;font-size:13px;margin:8px 0 0;padding-left:18px;line-height:1.8;">
              <li>Missing or unclear business logo/cover photo</li>
              <li>Incomplete business description (min. 50 words)</li>
              <li>Invalid phone number or address</li>
            </ul>
          </div>
          <a href="${SITE_URL}" style="display:inline-block;background:#1F1F1F;color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:15px;">
            Update My MBP
          </a>
        </td></tr>
        <tr><td style="background:#F9FAFB;padding:16px 32px;text-align:center;border-top:1px solid #E5E7EB;">
          <p style="margin:0;font-size:12px;color:#9CA3AF;">MBP – MakeMeTop Business Profile · Srinagar, J&amp;K · <a href="${SITE_URL}" style="color:#F5A623;">makemetop.in</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  GmailApp.sendEmail(toEmail, subject, '', { htmlBody: html, name: BRAND_NAME, replyTo: ADMIN_EMAIL });
  return jsonResponse({ status: 'sent' });
}

// ═══════════════════════════════════════════════════════════════
//  5. NEW REVIEW ALERT — notifies business owner
// ═══════════════════════════════════════════════════════════════
function sendNewReviewAlert(ownerEmail, businessName, reviewerName, rating) {
  if (!ownerEmail) return jsonResponse({ status: 'skipped' });

  const stars = '⭐'.repeat(rating || 5);
  const subject = `${stars} New review for ${businessName} on MBP`;
  const html = `
<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:#1F1F1F;padding:24px 32px;text-align:center;">
          <div style="font-size:24px;font-weight:900;color:#fff;">Make<span style="color:#F5A623;">Me</span>Top</div>
        </td></tr>
        <tr><td style="padding:32px;text-align:center;">
          <div style="font-size:40px;margin-bottom:12px;">${stars}</div>
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1F1F1F;">New Review!</h1>
          <p style="color:#6B7280;font-size:15px;line-height:1.6;">
            <strong style="color:#1F1F1F;">${reviewerName}</strong> left a ${rating}-star review on your MBP for <strong style="color:#1F1F1F;">${businessName}</strong>.
          </p>
          <a href="${SITE_URL}" style="display:inline-block;background:#1F1F1F;color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:15px;">
            View My MBP
          </a>
        </td></tr>
        <tr><td style="background:#F9FAFB;padding:16px 32px;text-align:center;border-top:1px solid #E5E7EB;">
          <p style="margin:0;font-size:12px;color:#9CA3AF;">MBP – MakeMeTop Business Profile · <a href="${SITE_URL}" style="color:#F5A623;">makemetop.in</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  GmailApp.sendEmail(ownerEmail, subject, '', { htmlBody: html, name: BRAND_NAME, replyTo: ADMIN_EMAIL });
  return jsonResponse({ status: 'sent' });
}

// ═══════════════════════════════════════════════════════════════
//  HELPER
// ═══════════════════════════════════════════════════════════════
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── TEST — run this manually in Apps Script editor to test emails ──
function testWelcomeEmail() {
  sendWelcomeEmail('abrarrtallks@gmail.com', 'Abrar');
}
function testApprovedEmail() {
  sendBusinessApprovedEmail('abrarrtallks@gmail.com', 'Abrar', 'Kashmir Sweets Srinagar');
}
