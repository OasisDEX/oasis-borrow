import * as nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'

import { EmailProvider } from '../types'

interface SendEmailOptions {
  smtpConfig: { host: string; port: string; user: string; pass: string }
  sender: string
  receiver: string
}

export function sendMailUsingSMTP({
  smtpConfig,
  sender,
  receiver,
}: SendEmailOptions): EmailProvider {
  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: parseInt(smtpConfig.port, 10),
    secure: false,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
  })

  const defaultMailOptions = {
    from: sender,
    to: receiver,
    replyTo: sender,
  }

  return async (options: Mail.Options) => {
    const mailOptions: Mail.Options = { ...defaultMailOptions, ...options }
    const mail = await transporter.sendMail(mailOptions)
    const response = mail.response as string

    if (!response.startsWith('250')) {
      throw new Error(`Email did not send - ${response}`)
    }
  }
}
