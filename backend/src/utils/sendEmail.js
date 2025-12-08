const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter (Testing ke liye console log use karenge agar SMTP nahi hai)
  // Real app ke liye yahan apne Gmail credentials daalein
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_EMAIL || 'test',
      pass: process.env.SMTP_PASSWORD || 'test',
    },
  });

  // Agar env variables set nahi hain to error na aaye, isliye hum link console mein dikha denge
  if (!process.env.SMTP_HOST) {
    console.log('----------------------------------------------------');
    console.log('⚠️  EMAIL SERVICE NOT CONFIGURED');
    console.log(`✉️  Email to: ${options.email}`);
    console.log(`🔗  Subject: ${options.subject}`);
    console.log(`📝  Message: ${options.message}`);
    console.log('----------------------------------------------------');
    return;
  }

  const message = {
    from: `${process.env.FROM_NAME || 'ReWear'} <${process.env.FROM_EMAIL || 'no-reply@rewear.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;