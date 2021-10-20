import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: 9 })

export default async function (_req: NextApiRequest, res: NextApiResponse) {
  const time = cache.get('time')
  if (!time) {
    axios({
      method: 'get',
      url: 'https://api.blocknative.com/gasprices/blockprices',
      responseType: 'json',
      headers: {
        Authorization: `${process.env.BLOCKNATIVE_API_KEY}`,
      },
    })
      .then((response) => {
        const responseFromBlocknative: any = response.data
        const estimatedPricesForNextBlock: any =
          responseFromBlocknative?.blockPrices[0].estimatedPrices
        const estimatedPriceFor95PercentConfidence = estimatedPricesForNextBlock[1]
        cache.set('time', new Date().getTime())
        cache.set('estimatedPriceFor95PercentConfidence', estimatedPriceFor95PercentConfidence)
        res.status(200)
        res.json({
          time: cache.get('time'),
          fromCache: false,
          maxPriorityFeePerGas: estimatedPriceFor95PercentConfidence.maxPriorityFeePerGas,
          maxFeePerGas: estimatedPriceFor95PercentConfidence.maxFeePerGas,
        })
      })
      .catch((error) => {
        console.log(error)
        res.status(error.status)
      })
  } else {
    const estimatedPriceFor95PercentConfidence = cache.get('estimatedPriceFor95PercentConfidence')
    res.json({
      time: time,
      fromCache: true,
      maxPriorityFeePerGas: estimatedPriceFor95PercentConfidence.maxPriorityFeePerGas,
      maxFeePerGas: estimatedPriceFor95PercentConfidence.maxFeePerGas,
    })
  }
}
