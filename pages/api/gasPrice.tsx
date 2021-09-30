import { NextApiRequest, NextApiResponse } from 'next'

const request = require('request')

export default async function (_req: NextApiRequest, res: NextApiResponse) {
  const options = {
    url: `https://api.blocknative.com/gasprices/blockprices`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: '44352ff7-890f-4334-a9e0-a9cfe0edd5cb',
    },
  }

  function callback(error: any, response: any, body: any) {
    if (!error && response.statusCode === 200) {
      res.json(body)
    }
  }

  request(options, callback)
}
