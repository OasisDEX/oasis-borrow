import type { NextApiHandler } from 'next'
// import { prisma } from 'server/prisma'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return null
    default:
      return res.status(405).end()
  }
}

export default handler
