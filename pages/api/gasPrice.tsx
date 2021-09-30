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
  console.log('gasPrice')

  function callback(error: any, response: any, body: any) {
    console.log('inside request', error)
    const responseFromBlocknative = JSON.parse(body)
    const estimatedPricesForNextBlock = responseFromBlocknative.blockPrices[0].estimatedPrices
    const estimatedPriceFor95PercentConfidence = estimatedPricesForNextBlock[1]
    console.log('inside request', estimatedPriceFor95PercentConfidence)
    if (!error && response.statusCode === 200) {
      cache.set('time', new Date().getTime())
      res.status(200)
      res.json({
        time: cache.get('time'),
        estimatedPriceFor95PercentConfidence
      })
    }
  }

  const time = cache.get('time')
  if (time === undefined) {
    // handle miss!
    request(options, callback)
  } else {
    res.json({
      time: time,
      fromCache: true,
    })
  }
}
