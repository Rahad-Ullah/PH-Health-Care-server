import nodemailer from "nodemailer";
import config from "../../../config";

const emailSender = async (email: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for port 465, false for other ports
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `"PH Health Care" <${config.emailSender.email}>`, // sender address
    to: email, // list of receivers
    subject: "Reset Password Link", // Subject line
    text: "", // plain text body
    html: html, // html body
  });

  console.log("Message sent: %s", info.messageId);
};

export default emailSender;
