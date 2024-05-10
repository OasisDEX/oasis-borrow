import { type Prisma, type PrismaPromise, type Protocol, EarnStrategies } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { networks } from 'blockchain/networks'
import type { Tickers } from 'blockchain/prices.types'
import { Erc4626PseudoProtocol } from 'features/omni-kit/protocols/morpho-blue/constants'
import type { ProductHubItem, ProductHubItemWithFlattenTooltip } from 'features/productHub/types'
import { filterTableData, getMissingHandlers, measureTime } from 'handlers/product-hub/helpers'
import type { HandleUpdateProductHubDataProps } from 'handlers/product-hub/types'
import { PRODUCT_HUB_HANDLERS } from 'handlers/product-hub/update-handlers'
import { tokenTickers } from 'helpers/api/tokenTickers'
import { flatten, uniq } from 'lodash'
import type { NextApiResponse } from 'next'
import { prisma } from 'server/prisma'

export async function getProductHubData(protocols: string[], testnet = false) {
  const network = networks
    .filter(({ testnet: isTestnet }) => isTestnet === testnet)
    .map(({ name }) => name)

  const response = await prisma.productHubItems.findMany({
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

  return {
    table: response.map(filterTableData) as ProductHubItem[],
  }
}

type ProtocolError = {
  protocol: Protocol
  error: Error | unknown
  message: string
  stack: string | undefined
  cause: string | undefined | unknown
}

const isProtocolError = (error: unknown): error is ProtocolError => {
  return error !== undefined && typeof error === 'object' && error !== null && 'protocol' in error
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
    if (!protocols || !Array.isArray(protocols) || protocols.length <= 0) {
      return res.status(400).json({
        errorMessage:
          'Missing required parameters (protocols), check error object for more details',
        error: {
          protocols: JSON.stringify(protocols),
        },
        dryRun,
      })
    }
    const missingHandlers = getMissingHandlers(protocols)
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
    const tickers = await tokenTickers()
    if (!tickers) {
      return res.status(502).json({
        errorMessage: 'Error getting token tickers',
        dryRun,
      })
    }

    const parsedTickers = Object.entries(tickers).reduce((acc, [key, value]) => {
      acc[key.toLowerCase()] = new BigNumber(value as any)
      return acc
    }, {} as Tickers)

    const dataHandlersPromiseList = await Promise.all(
      handlersList.map(({ name, call }) => {
        const startTime = Date.now()
        return call(parsedTickers)
          .then(({ table, warnings }) => ({
            name, // protocol name
            warnings,
            data: table,
            processingTime: measureTime ? Date.now() - startTime : undefined,
          }))
          .catch((error) => {
            const wrappedError: ProtocolError = {
              protocol: name,
              message: `Error processing data for protocol "${name}"`,
              error: error,
              stack: undefined,
              cause: undefined,
            }

            if (error instanceof Error) {
              wrappedError.cause = error.cause
              wrappedError.stack = error.stack
              wrappedError.error = error
            }

            throw wrappedError
          })
      }),
    )

    const createData = flatten([
      ...dataHandlersPromiseList.map(({ data }) => data),
    ]) as ProductHubItemWithFlattenTooltip[]
    const protocolsInResponse = uniq(createData.map((item) => item.protocol))
    const protocolsToRemove = dataHandlersPromiseList
      .map(({ name }) => name)
      .filter((protocol) => protocolsInResponse.includes(protocol))
    const removeErc4626Products = !!dataHandlersPromiseList.find(
      ({ name }) => (name as string) === Erc4626PseudoProtocol,
    )

    const txItems: PrismaPromise<Prisma.BatchPayload>[] = [
      prisma.productHubItems.deleteMany({
        where: {
          OR: [
            {
              protocol: {
                in: protocolsToRemove,
              },
            },
            ...(removeErc4626Products ? [{ earnStrategy: EarnStrategies.erc_4626 }] : []),
          ],
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
    if (isProtocolError(error)) {
      return res.status(502).json({
        errorMessage: `Error processing data for protocol "${error.protocol}"`,
        innerError: error.error?.toString(),
        dryRun: body.dryRun,
        body: JSON.stringify(body),
        stack: error.stack,
        cause: error.cause,
      })
    }
    return res.status(502).json({
      errorMessage: 'Critical Error updating Product Hub data',
      // @ts-ignore
      error: error.toString(),
      body: JSON.stringify(body),
      dryRun: body.dryRun,
    })
  }
}
