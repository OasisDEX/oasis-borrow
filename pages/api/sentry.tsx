import { withSentry } from '@sentry/nextjs'
import axios from 'axios'
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST':
      return tunnel(req, res)
    default:
      return res.status(405).end()
  }
}

const SENTRY_HOST = 'o1143494.ingest.sentry.io'
const SENTRY_PROJECT_IDS = ['6204127']

async function tunnel(req: NextApiRequest, res: NextApiResponse) {
  const envelope = req.body
  const piece = envelope.split('\n')[0]
  const header = JSON.parse(piece)
  const dsn = new URL(header.dsn)
  const projectId = dsn.pathname.replace('/', '')
  const upstreamSentryUrl = `https://${SENTRY_HOST}/api/${projectId}/envelope/`

  if (dsn.hostname === SENTRY_HOST && SENTRY_PROJECT_IDS.includes(projectId)) {
    const postRes = await axios.post(upstreamSentryUrl, envelope)
    if (postRes.status === 200) {
      return res.status(200).json('tunnel/ok')
    } else {
      return res.status(500).json({ error: `tunnel/error` })
    }
  }
}

export default withSentry(handler)
