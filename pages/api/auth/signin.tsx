import { makeSignIn } from 'handlers/signature-auth/signin'
import { withPreflightHandler } from 'helpers/api/withPreflightHandler'
import type { NextApiHandler } from 'next'
import { config } from 'server/config'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST':
      return await makeSignIn({
        challengeJWTSecret: config.challengeJWTSecret,
        userJWTSecret: config.userJWTSecret,
      })(req, res)
    default:
      return res.status(405).end()
  }
}

export default withPreflightHandler(handler)
