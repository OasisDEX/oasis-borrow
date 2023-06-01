import { Protocol } from '@prisma/client'
import { productHubData as mockData } from 'helpers/mocks/productHubData.mock'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'

import { checkIfAllHandlersExist, filterTableData, measureTime } from './helpers'
import { HandleGetProductHubDataProps, HandleUpdateProductHubDataProps } from './types'
import { PRODUCT_HUB_HANDLERS } from './update-handlers'

export async function handleGetProductHubData(
  req: HandleGetProductHubDataProps,
  res: NextApiResponse,
) {
  const { protocols, promoCardsCollection } = req.body
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
  await prisma.productHubItems
    .findMany({
      where: {
        OR: protocols.map((protocol) => ({
          protocol: {
            equals: protocol as Protocol,
          },
        })),
      },
    })
    .then((table) => {
      return res.status(200).json({
        promoCards: mockData.promoCards,
        table: table.map(filterTableData),
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
  const { protocols } = req.body
  if (!protocols || !protocols.length) {
    return res.status(400).json({
      errorMessage: 'Missing required parameters (protocols), check error object for more details',
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
        name,
        data,
        processingTime: measureTime ? Date.now() - startTime : undefined,
      }))
    }),
  )
  return res.status(200).json({ data: dataHandlersPromiseList })
}

export async function mockProductHubData(req: NextApiRequest, res: NextApiResponse) {
  // this mocks the data using a static file mock
  // and creates necessary rows in the db (careful with this)
  // add this to the handler
  // case 'PUT':
  //   return await mockProductHubData(req, res)
  // and use postman to send a PUT request to the endpoint
  await prisma.productHubItems
    .createMany({
      // @ts-ignore
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
