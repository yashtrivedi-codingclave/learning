import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// Send a plain-text email (plain text, so a name like "<b>" can't inject HTML)
export const sendMail = (to, subject, text) => {
  return transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
};
