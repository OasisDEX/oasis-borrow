import { Protocol } from '@prisma/client'
import { networks } from 'blockchain/networks'
import { ProductHubItem } from 'features/productHub/types'
import { checkIfAllHandlersExist, filterTableData, measureTime } from 'handlers/product-hub/helpers'
import { PROMO_CARD_COLLECTIONS_PARSERS } from 'handlers/product-hub/promo-card-collections-parsers'
import {
  HandleGetProductHubDataProps,
  HandleUpdateProductHubDataProps,
} from 'handlers/product-hub/types'
import { PRODUCT_HUB_HANDLERS } from 'handlers/product-hub/update-handlers'
import { productHubData as mockData } from 'helpers/mocks/productHubData.mock'
import { flatten } from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'

export async function handleGetProductHubData(
  req: HandleGetProductHubDataProps,
  res: NextApiResponse,
) {
  const { protocols, promoCardsCollection, testnet = false } = req.body
  if (!protocols || !protocols.length || !promoCardsCollection) {
    return res.status(400).json({
      errorMessage:
        'Missing required parameters (protocols, promoCardsCollection), check error object for more details',
      error: {
        protocols: JSON.stringify(protocols),
        promoCardsCollection: JSON.stringify(promoCardsCollection),
      },
    })
  }

  const network = networks
    .filter((network) => network.testnet === testnet)
    .map((network) => network.name)

  await prisma.productHubItems
    .findMany({
      where: {
        OR: protocols.map((protocol) => ({
          protocol: {
            equals: protocol as Protocol,
          },
          network: {
            in: network,
          },
        })),
      },
    })
    .then((rawTable) => {
      const table = rawTable.map(filterTableData) as ProductHubItem[]
      const promoCards = PROMO_CARD_COLLECTIONS_PARSERS[promoCardsCollection](table)

      return res.status(200).json({
        promoCards,
        table,
      })
    })
    .catch((error) => {
      return res.status(500).json({
        errorMessage: 'Error getting product hub data',
        error: error.toString(),
      })
    })
}

export async function updateProductHubData(
  req: HandleUpdateProductHubDataProps,
  res: NextApiResponse,
) {
  try {
    const { headers, body } = req
    if ([undefined, ''].includes(process.env.PRODUCT_HUB_KEY)) {
      return res.status(400).json({
        errorMessage: 'Missing env variable',
      })
    }
    if (headers.authorization !== process.env.PRODUCT_HUB_KEY) {
      return res.status(400).json({
        errorMessage: 'Missing header parameter',
      })
    }
    const { protocols } = body
    if (!protocols || !protocols.length) {
      return res.status(400).json({
        errorMessage:
          'Missing required parameters (protocols), check error object for more details',
        error: {
          protocols: JSON.stringify(protocols),
        },
      })
    }
    const missingHandlers = checkIfAllHandlersExist(protocols)
    if (missingHandlers.length > 0) {
      return res.status(501).json({
        errorMessage: `Handler for protocol "${missingHandlers.join('", "')}" not implemented`,
      })
    }
    const handlersList = protocols.map((protocol) => {
      return {
        name: protocol,
        call: PRODUCT_HUB_HANDLERS[protocol],
      }
    })
    const dataHandlersPromiseList = await Promise.all(
      handlersList.map(({ name, call }) => {
        const startTime = Date.now()
        return call().then((data) => ({
          name, // protocol name
          data,
          processingTime: measureTime ? Date.now() - startTime : undefined,
        }))
      }),
    )

    try {
      await prisma.productHubItems.deleteMany({
        where: {
          protocol: {
            in: dataHandlersPromiseList.map(({ name }) => name),
          },
        },
      })
    } catch (error) {
      return res.status(502).json({
        errorMessage: 'Error removing old Product Hub data',
        // @ts-ignore
        error: error.toString(),
        data: dataHandlersPromiseList,
      })
    }

    const createData = flatten([...dataHandlersPromiseList.map(({ data }) => data)])
    try {
      await prisma.productHubItems.createMany({
        data: createData,
      })
    } catch (error) {
      return res.status(502).json({
        errorMessage: 'Error updating Product Hub data',
        // @ts-ignore
        error: error.toString(),
        data: dataHandlersPromiseList,
        createData,
      })
    }
    return res.status(200).json({ data: dataHandlersPromiseList })
  } catch (error) {
    const { body } = req
    return res.status(502).json({
      errorMessage: 'Critical Error updating Product Hub data',
      // @ts-ignore
      error: error.toString(),
      body: JSON.stringify(body),
    })
  }
}

export async function mockProductHubData(req: NextApiRequest, res: NextApiResponse) {
  const { headers } = req
  if ([undefined, ''].includes(process.env.PRODUCT_HUB_KEY)) {
    return res.status(400).json({
      errorMessage: 'Missing env variable',
    })
  }
  if (headers.authorization !== process.env.PRODUCT_HUB_KEY) {
    return res.status(400).json({
      errorMessage: 'Missing query parameter',
    })
  }
  // this mocks the data using a static file mock
  // and creates necessary rows in the db (careful with this)
  // add this to the handler
  // case 'PUT':
  //   return await mockProductHubData(req, res)
  // and use postman to send a PUT request to the endpoint
  await prisma.productHubItems
    .createMany({
      data: mockData.table.map(({ tooltips, ...item }) => ({
        ...item,
      })),
      skipDuplicates: true,
    })
    .then((_data) => {
      return res.status(200).json({
        message: 'Mocked product hub data',
      })
    })
    .catch((error) => {
      return res.status(500).json({
        errorMessage: 'Error mocking product hub data',
        error: error.toString(),
      })
    })
}
