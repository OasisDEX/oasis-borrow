import type { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  const baseUrl = process.env.SDK_API_URL
  if (!baseUrl) {
    return res.status(500).json({ error: 'SDK_API_URL is not set' })
  }

  const url = baseUrl + req.url
  const headers = {}
  let response

  const method = req.method
  if (method === 'GET') {
    response = await fetch(url, { headers })
  } else if (method === 'POST') {
    response = await fetch(url, { headers, method, body: JSON.stringify(req.body) })
  } else {
    return res.status(400).json({ error: 'Invalid method' })
  }

  const json = await response.json()
  // pass the json from api to the client
  return res.status(response.status).json(json)
}

export default handler
