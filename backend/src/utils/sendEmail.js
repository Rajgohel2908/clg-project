const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Agar SMTP settings nahi hain to Terminal mein link dikhayenge
  if (!process.env.SMTP_HOST) {
    console.log('----------------------------------------------------');
    console.log('⚠️  EMAIL SERVICE NOT CONFIGURED (Check Terminal)');
    console.log(`✉️  Email to: ${options.email}`);
    console.log(`🔗  Link: ${options.message.split('request to: \n\n ')[1]}`); // Sirf link dikhayega
    console.log('----------------------------------------------------');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'ReWear'} <${process.env.FROM_EMAIL || 'no-reply@rewear.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;