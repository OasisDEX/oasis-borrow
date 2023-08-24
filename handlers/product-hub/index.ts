import { Prisma, PrismaPromise, Protocol } from '@prisma/client'
import { networks } from 'blockchain/networks'
import { ProductHubItem, ProductHubItemWithFlattenTooltip } from 'features/productHub/types'
import { checkIfAllHandlersExist, filterTableData, measureTime } from 'handlers/product-hub/helpers'
import { PROMO_CARD_COLLECTIONS_PARSERS } from 'handlers/product-hub/promo-cards'
import {
  HandleGetProductHubDataProps,
  HandleUpdateProductHubDataProps,
} from 'handlers/product-hub/types'
import { PRODUCT_HUB_HANDLERS } from 'handlers/product-hub/update-handlers'
import { flatten, uniq } from 'lodash'
import { NextApiResponse } from 'next'
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
    const { protocols, dryRun = false } = body
    if (!protocols || !protocols.length) {
      return res.status(400).json({
        errorMessage:
          'Missing required parameters (protocols), check error object for more details',
        error: {
          protocols: JSON.stringify(protocols),
        },
        dryRun,
      })
    }
    const missingHandlers = checkIfAllHandlersExist(protocols)
    if (missingHandlers.length > 0) {
      return res.status(501).json({
        errorMessage: `Handler for protocol "${missingHandlers.join('", "')}" not implemented`,
        dryRun,
      })
    }
    const handlersList = protocols.map((protocol) => {
      return {
        name: protocol,
        call: PRODUCT_HUB_HANDLERS[protocol],
      }
    })
    const tickers = await (await fetch(`/api/tokensPrices`)).json()

    const dataHandlersPromiseList = await Promise.all(
      handlersList.map(({ name, call }) => {
        const startTime = Date.now()
        return call(tickers).then(({ table, warnings }) => ({
          name, // protocol name
          warnings,
          data: table,
          processingTime: measureTime ? Date.now() - startTime : undefined,
        }))
      }),
    )

    const createData = flatten([
      ...dataHandlersPromiseList.map(({ data }) => data),
    ]) as ProductHubItemWithFlattenTooltip[]
    const protocolsInResponse = uniq(createData.map((item) => item.protocol))
    const protocolsToRemove = dataHandlersPromiseList
      .map(({ name }) => name)
      .filter((protocol) => protocolsInResponse.includes(protocol))

    const txItems: PrismaPromise<Prisma.BatchPayload>[] = [
      prisma.productHubItems.deleteMany({
        where: {
          protocol: {
            in: protocolsToRemove,
          },
        },
      }),
      prisma.productHubItems.createMany({
        data: createData,
      }),
    ]

    try {
      !dryRun && (await prisma.$transaction(txItems))
    } catch (error) {
      return res.status(502).json({
        errorMessage: 'Error altering Product Hub data',
        // @ts-ignore
        error: error.toString(),
        data: dataHandlersPromiseList,
        dryRun,
      })
    }

    return res.status(200).json({ data: dataHandlersPromiseList, dryRun })
  } catch (error) {
    const { body } = req
    return res.status(502).json({
      errorMessage: 'Critical Error updating Product Hub data',
      // @ts-ignore
      error: error.toString(),
      body: JSON.stringify(body),
      dryRun: body.dryRun,
    })
  }
}
