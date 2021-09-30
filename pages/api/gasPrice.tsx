import { NextApiRequest, NextApiResponse } from 'next'

const request = require('request')
const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: 9 })

export default async function (_req: NextApiRequest, res: NextApiResponse) {
  const options = {
    url: `https://api.blocknative.com/gasprices/blockprices`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: '44352ff7-890f-4334-a9e0-a9cfe0edd5cb',
    },
  }

  function callback(error: any, response: any, body: any) {
    console.log(body === undefined)
    if (!error && response.statusCode === 200) {
      cache.set('time', new Date().getTime())
      res.json({
        time: cache.get('time'),
      })
    }
  }

  const time = cache.get('time')
  if (time === undefined) {
    // handle miss!
    request(options, callback)
  } else {
    res.json
  }
}
