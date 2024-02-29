const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'madisen.kertzmann7@ethereal.email',
        pass: 'w4DJBjKsQBQ78QEnjj',
      },
    });
    // 2)define the email options
    const mailOptions = {
      from: 'Vansh Sutariya <vanshSutariya111@gmail.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
    };
    // 3)actual send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
  }
};

module.exports = sendEmail;
