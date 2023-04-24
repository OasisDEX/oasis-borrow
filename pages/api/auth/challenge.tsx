import { makeChallenge } from 'handlers/signature-auth/challenge'
import { NextApiHandler } from 'next'
import { config } from 'server/config'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST':
      return await makeChallenge({ challengeJWTSecret: config.challengeJWTSecret })(req, res)
    default:
      return res.status(405).end()
  }
}
export default handler
