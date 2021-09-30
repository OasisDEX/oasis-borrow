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
  console.log('gasPrice')

  function callback(error: any, response: any, body: any) {
    console.log('inside request', error)
    const responseFromBlocknative = JSON.parse(body)
    const estimatedPricesForNextBlock = responseFromBlocknative.blockPrices[0].estimatedPrices
    const estimatedPriceFor95PercentConfidence = estimatedPricesForNextBlock[1]
    console.log('inside request', estimatedPriceFor95PercentConfidence)
    if (!error && response.statusCode === 200) {
      res.status(200)
      res.json(estimatedPriceFor95PercentConfidence)
    }
  }

  request(options, callback)
}
