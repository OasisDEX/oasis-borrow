import { makeChallenge } from 'handlers/signature-auth/challenge'

export default makeChallenge({ challengeJWTSecret: process.env.CHALLENGE_JWT_SECRET! })
