const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const readHTMLFile = (templateName, callback) => {
  fs.readFile(
    path.resolve(__dirname, './emailTemplates/' + templateName + '.html'),
    { encoding: 'utf-8' },
    function (err, html) {
      if (err) {
        throw err;
        callback(err);
      } else {
        callback(null, html);
      }
    },
  );
};

const sendEmail = async options => {
  // 1) Create a transporter

  console.log(process.env.EMAIL_HOST);

  const transporter = nodemailer.createTransport(
    smtpTransport({
      // service: 'Gmail',
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },

      // To work it with gmail you'll have to turn "less secure app" option
    }),
  );

  // 2) Define the email options
  const mailOptions = {
    from: 'Merchpals <no-reply@merchpals.com>',
    to: options.email,
    subject: options.subject,
    // text: options.text,
  };
  console.log({ mailOptions });

  if (options.template) {
    readHTMLFile(options.template, async (err, html) => {
      const template = handlebars.compile(html);
      const htmlToSend = template(options.replacements);
      mailOptions.html = htmlToSend;
      await transporter.sendMail(mailOptions);
    });
    return;
  } else {
    mailOptions.text = options.text;
  }

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
