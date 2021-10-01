import { NextApiRequest, NextApiResponse } from 'next'

const request = require('request')
const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: 9 })

export default async function (_req: NextApiRequest, res: NextApiResponse) {
  const options = {
    url: `https://api.blocknative.com/gasprices/blockprices`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.BLOCKNATIVE_API_KEY,
    },
  }

  function callback(error: any, response: any, body: any) {
    const responseFromBlocknative = JSON.parse(body)
    const estimatedPricesForNextBlock = responseFromBlocknative?.blockPrices[0].estimatedPrices
    // TODO LW - what do to when responseFromBlocknative had no blockPrices ? It happens when doing multiple requests one after another
    const estimatedPriceFor95PercentConfidence = estimatedPricesForNextBlock[1]
    if (!error && response.statusCode === 200) {
      cache.set('time', new Date().getTime())
      cache.set('estimatedPriceFor95PercentConfidence', estimatedPriceFor95PercentConfidence)
      res.status(200)
      res.json({
        time: cache.get('time'),
        fromCache: false,
        estimatedPriceFor95PercentConfidence,
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
      estimatedPriceFor95PercentConfidence: cache.get('estimatedPriceFor95PercentConfidence'),
    })
  }
}
