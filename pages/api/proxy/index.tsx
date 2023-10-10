import type { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      if (req.url && req.query.url) {
        const response = await fetch(req.url.replace('/api/proxy?url=', ''))

        return res.status(response.status).json(await response.json())
      } else return res.status(500).end()
    default:
      return res.status(405).end()
  }
}

export default handler
