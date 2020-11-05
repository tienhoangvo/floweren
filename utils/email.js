const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

const {
  NODE_ENV,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  EMAIL_FROM,
  SENDGRID_USERNAME,
  SENDGRID_PASSWORD,
} = process.env;

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = EMAIL_FROM;
  }

  initializeTransport() {
    // if (NODE_ENV === 'development') {
    //   // Mailtrap
    //   return nodemailer.createTransport({
    //     host: EMAIL_HOST,
    //     port: EMAIL_PORT,
    //     auth: {
    //       user: EMAIL_USERNAME,
    //       pass: EMAIL_PASSWORD,
    //     },
    //   });
    // }

    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: SENDGRID_USERNAME,
        pass: SENDGRID_PASSWORD,
      },
    });
  }

  // Send email
  async send(template, subject) {
    // 1) Render HTML based on the pug template
    const html = pug.renderFile(
      `${__dirname}/../views/email/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    // 2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: htmlToText.fromString(html),
    };

    // 3) Create a transport and send email

    const mailInfo = await this.initializeTransport().sendMail(
      mailOptions
    );

    console.log(mailInfo);
  }

  async sendEmailVerificiationCode() {
    await this.send(
      'verifyEmail',
      'Your email verification token (valid for only 10 minutes)'
    );
  }

  async sendWelcome() {
    await this.send(
      'welcome',
      'Welcome to the Flooens family!'
    );
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
