import { makeSignIn } from 'handlers/signature-auth/signin'

export default makeSignIn({
  challengeJWTSecret: process.env.CHALLENGE_JWT_SECRET!,
  userJWTSecret: process.env.USER_JWT_SECRET!,
})
