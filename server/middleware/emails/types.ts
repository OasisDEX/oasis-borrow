import Mail from 'nodemailer/lib/mailer'

export type EmailProvider = (options: Mail.Options) => Promise<void>
