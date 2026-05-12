const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: 'Segoe UI', sans-serif; background: #0f172a; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; }
  .header { background: linear-gradient(135deg, #1d4ed8, #3b82f6); padding: 32px 40px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
  .header p { color: #bfdbfe; margin: 6px 0 0; font-size: 13px; }
  .body { padding: 36px 40px; color: #e2e8f0; line-height: 1.7; }
  .body h2 { color: #fff; font-size: 18px; margin: 0 0 16px; }
  .body p { color: #94a3b8; margin: 0 0 14px; font-size: 14px; }
  .cta { display: inline-block; margin: 20px 0; padding: 12px 28px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
  .credentials { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .credentials p { margin: 6px 0; font-size: 14px; }
  .credentials span { color: #3b82f6; font-weight: 600; }
  .footer { padding: 20px 40px; text-align: center; border-top: 1px solid #334155; }
  .footer p { color: #475569; font-size: 12px; margin: 0; }
</style></head>
<body><div class="container">${content}</div></body>
</html>`;

const send = async (to, subject, html) => {
  try {
    await transporter.sendMail({ from: `process.env.COMPANY_NAME || "Internship LMS" <${process.env.EMAIL_USER}>`, to, subject, html });
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

module.exports = {
  sendWelcomeEmail: (email, name, loginEmail, password) => send(email, 'Welcome to Internship LMS', baseTemplate(`
    <div class="header"><h1>Internship Learning Management System</h1><p>Welcome aboard!</p></div>
    <div class="body">
      <h2>Hello, ${name}!</h2>
      <p>Your account has been created. Here are your login credentials:</p>
      <div class="credentials">
        <p>Email: <span>${loginEmail}</span></p>
        <p>Password: <span>${password}</span></p>
      </div>
      <p>Please login and change your password immediately.</p>
      <a href="${process.env.CLIENT_URL}/login" class="cta">Login to Dashboard</a>
    </div>
    <div class="footer"><p>This is an automated message. Please do not reply.</p></div>`)),

  sendPasswordReset: (email, name, resetUrl) => send(email, 'Password Reset Request', baseTemplate(`
    <div class="header"><h1>Password Reset</h1><p>Secure your account</p></div>
    <div class="body">
      <h2>Hello, ${name}</h2>
      <p>Click the button below to reset your password. This link expires in 30 minutes.</p>
      <a href="${resetUrl}" class="cta">Reset Password</a>
      <p>If you did not request this, ignore this email.</p>
    </div>
    <div class="footer"><p>This is an automated message. Please do not reply.</p></div>`)),

  sendTaskAssignment: (email, name, taskTitle, dueDate) => send(email, `New Task: ${taskTitle}`, baseTemplate(`
    <div class="header"><h1>New Task Assigned</h1><p>Action required</p></div>
    <div class="body">
      <h2>Hello, ${name}</h2>
      <p>You have been assigned a new task:</p>
      <div class="credentials"><p>Task: <span>${taskTitle}</span></p><p>Due: <span>${new Date(dueDate).toDateString()}</span></p></div>
      <a href="${process.env.CLIENT_URL}/intern/tasks" class="cta">View Task</a>
    </div>
    <div class="footer"><p>This is an automated message.</p></div>`)),

  sendCertificateEmail: (email, name, pdfUrl, type) => send(email, `Your ${type === 'completion' ? 'Completion Certificate' : 'Experience Letter'} is Ready`, baseTemplate(`
    <div class="header"><h1>Certificate Ready</h1><p>Congratulations!</p></div>
    <div class="body">
      <h2>Hello, ${name}!</h2>
      <p>Your ${type === 'completion' ? 'internship completion certificate' : 'experience letter'} has been generated.</p>
      <a href="${pdfUrl}" class="cta">Download Certificate</a>
    </div>
    <div class="footer"><p>This is an automated message.</p></div>`)),

  sendDeadlineReminder: (email, name, tasks) => send(email, 'Upcoming Task Deadlines', baseTemplate(`
    <div class="header"><h1>Deadline Reminder</h1><p>Tasks due soon</p></div>
    <div class="body">
      <h2>Hello, ${name}</h2>
      <p>The following tasks are due soon:</p>
      <div class="credentials">${tasks.map(t => `<p>${t.title}: <span>${new Date(t.dueDate).toDateString()}</span></p>`).join('')}</div>
      <a href="${process.env.CLIENT_URL}/intern/tasks" class="cta">View Tasks</a>
    </div>
    <div class="footer"><p>This is an automated message.</p></div>`)),

  sendWeeklyReport: (email, name, stats) => send(email, 'Weekly Performance Report', baseTemplate(`
    <div class="header"><h1>Weekly Report</h1><p>Your performance summary</p></div>
    <div class="body">
      <h2>Hello, ${name}</h2>
      <div class="credentials">
        <p>Tasks Completed: <span>${stats.tasksCompleted}</span></p>
        <p>Attendance: <span>${stats.attendance}%</span></p>
        <p>Performance Score: <span>${stats.score}</span></p>
      </div>
      <a href="${process.env.CLIENT_URL}/intern/dashboard" class="cta">View Dashboard</a>
    </div>
    <div class="footer"><p>This is an automated message.</p></div>`))
};
