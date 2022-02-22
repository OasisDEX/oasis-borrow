import { withSentry } from '@sentry/nextjs'
import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: 9 })

const handler = async function (_req: NextApiRequest, res: NextApiResponse) {
  const time = cache.get('time')
  if (!time) {
    axios({
      method: 'get',
      timeout: 1000,
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
        res.status(200)
        res.json({
          time: cache.get('time'),
          fromCache: false,
          maxPriorityFeePerGas: 0,
          maxFeePerGas: 0,
          error: error.message,
        })
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

export default withSentry(handler)
