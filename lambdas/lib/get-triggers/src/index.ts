/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import { z } from 'zod'
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { ResponseBadRequest, ResponseInternalServerError, ResponseOk } from 'shared/responses'
import {
  addressSchema,
  chainIdsSchema,
  protocolIdsSchema,
  urlOptionalSchema,
} from 'shared/validators'

import { getAutomationSubgraphClient } from 'automation-subgraph'

import { Logger } from '@aws-lambda-powertools/logger'
import {
  AaveBasicBuy,
  AaveBasicBuyV2ID,
  AaveBasicSell,
  AaveBasicSellV2ID,
  AaveStopLossToCollateral,
  AaveStopLossToCollateralV2ID,
  AaveStopLossToDebt,
  AaveStopLossToDebtV2ID,
  GetTriggersResponse,
  SparkStopLossToCollateral,
  SparkStopLossToCollateralV2ID,
  SparkStopLossToDebt,
  SparkStopLossToDebtV2ID,
} from './types/GetTriggersResponse'

const logger = new Logger({ serviceName: 'getTriggersFunction' })

const paramsSchema = z.object({
  wallet: addressSchema,
  dpm: addressSchema,
  chainId: chainIdsSchema,
  rpc: urlOptionalSchema,
})

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  //set envs
  const { RPC_GATEWAY, SUBGRAPH_BASE } = (event.stageVariables as Record<string, string>) || {
    RPC_GATEWAY: process.env.RPC_GATEWAY,
    SUBGRAPH_BASE: process.env.SUBGRAPH_BASE,
  }

  if (!SUBGRAPH_BASE) {
    logger.error('SUBGRAPH_BASE is not set')
    return ResponseInternalServerError('SUBGRAPH_BASE is not set')
  }

  const parseResult = paramsSchema.safeParse(event.queryStringParameters)
  if (!parseResult.success) {
    logger.warn('Incorrect query params', {
      params: event.queryStringParameters,
      errors: parseResult.error.errors,
    })
    return ResponseBadRequest({
      message: 'Validation Errors',
      errors: parseResult.error.errors,
    })
  }
  const params = parseResult.data

  const automationSubgraphClient = getAutomationSubgraphClient({
    urlBase: SUBGRAPH_BASE,
    chainId: params.chainId[0],
    logger,
  })

  const triggers = await automationSubgraphClient.getTriggers(params)

  const aaveStopLossToCollateral: AaveStopLossToCollateral | undefined = triggers.triggers
    .filter((trigger) => trigger.triggerType == AaveStopLossToCollateralV2ID)
    .map((trigger) => {
      return {
        triggerTypeName: 'AaveStopLossToCollateralV2' as const,
        triggerType: AaveStopLossToCollateralV2ID,
        triggerId: trigger.id,
        decodedParams: {
          positionAddress: trigger.decodedData[trigger.decodedDataNames.indexOf('positionAddress')],
          triggerType: trigger.decodedData[trigger.decodedDataNames.indexOf('triggerType')],
          maxCoverage: trigger.decodedData[trigger.decodedDataNames.indexOf('maxCoverage')],
          debtToken: trigger.decodedData[trigger.decodedDataNames.indexOf('debtToken')],
          collateralToken: trigger.decodedData[trigger.decodedDataNames.indexOf('collateralToken')],
          ltv: trigger.decodedData[trigger.decodedDataNames.indexOf('ltv')],
        },
      }
    })[0]

  const aaveStopLossToDebt: AaveStopLossToDebt | undefined = triggers.triggers
    .filter((trigger) => trigger.triggerType == AaveStopLossToDebtV2ID)
    .map((trigger) => {
      return {
        triggerTypeName: 'AaveStopLossToDebtV2' as const,
        triggerType: AaveStopLossToDebtV2ID,
        triggerId: trigger.id,
        decodedParams: {
          positionAddress: trigger.decodedData[trigger.decodedDataNames.indexOf('positionAddress')],
          triggerType: trigger.decodedData[trigger.decodedDataNames.indexOf('triggerType')],
          maxCoverage: trigger.decodedData[trigger.decodedDataNames.indexOf('maxCoverage')],
          debtToken: trigger.decodedData[trigger.decodedDataNames.indexOf('debtToken')],
          collateralToken: trigger.decodedData[trigger.decodedDataNames.indexOf('collateralToken')],
          ltv: trigger.decodedData[trigger.decodedDataNames.indexOf('ltv')],
        },
      }
    })[0]

  const sparkStopLossToCollateral: SparkStopLossToCollateral | undefined = triggers.triggers
    .filter((trigger) => trigger.triggerType == SparkStopLossToCollateralV2ID)
    .map((trigger) => {
      return {
        triggerTypeName: 'SparkStopLossToCollateralV2' as const,
        triggerType: SparkStopLossToCollateralV2ID,
        triggerId: trigger.id,
        decodedParams: {
          positionAddress: trigger.decodedData[trigger.decodedDataNames.indexOf('positionAddress')],
          triggerType: trigger.decodedData[trigger.decodedDataNames.indexOf('triggerType')],
          maxCoverage: trigger.decodedData[trigger.decodedDataNames.indexOf('maxCoverage')],
          debtToken: trigger.decodedData[trigger.decodedDataNames.indexOf('debtToken')],
          collateralToken: trigger.decodedData[trigger.decodedDataNames.indexOf('collateralToken')],
          ltv: trigger.decodedData[trigger.decodedDataNames.indexOf('ltv')],
        },
      }
    })[0]

  const sparkStopLossToDebt: SparkStopLossToDebt | undefined = triggers.triggers
    .filter((trigger) => trigger.triggerType == SparkStopLossToDebtV2ID)
    .map((trigger) => {
      return {
        triggerTypeName: 'SparkStopLossToDebtV2' as const,
        triggerType: SparkStopLossToDebtV2ID,
        triggerId: trigger.id,
        decodedParams: {
          positionAddress: trigger.decodedData[trigger.decodedDataNames.indexOf('positionAddress')],
          triggerType: trigger.decodedData[trigger.decodedDataNames.indexOf('triggerType')],
          maxCoverage: trigger.decodedData[trigger.decodedDataNames.indexOf('maxCoverage')],
          debtToken: trigger.decodedData[trigger.decodedDataNames.indexOf('debtToken')],
          collateralToken: trigger.decodedData[trigger.decodedDataNames.indexOf('collateralToken')],
          ltv: trigger.decodedData[trigger.decodedDataNames.indexOf('ltv')],
        },
      }
    })[0]

  const aaveBasicBuy: AaveBasicBuy | undefined = triggers.triggers
    .filter((trigger) => trigger.triggerType == AaveBasicBuyV2ID)
    .map((trigger) => {
      return {
        triggerTypeName: 'AaveBasicBuyV2' as const,
        triggerType: AaveBasicBuyV2ID,
        triggerId: trigger.id,
        decodedParams: {
          positionAddress: trigger.decodedData[trigger.decodedDataNames.indexOf('positionAddress')],
          triggerType: trigger.decodedData[trigger.decodedDataNames.indexOf('triggerType')],
          maxCoverage: trigger.decodedData[trigger.decodedDataNames.indexOf('maxCoverage')],
          debtToken: trigger.decodedData[trigger.decodedDataNames.indexOf('debtToken')],
          collateralToken: trigger.decodedData[trigger.decodedDataNames.indexOf('collateralToken')],
          opHash: trigger.decodedData[trigger.decodedDataNames.indexOf('opHash')],
          execLtv: trigger.decodedData[trigger.decodedDataNames.indexOf('execLtv')],
          targetLtv: trigger.decodedData[trigger.decodedDataNames.indexOf('targetLtv')],
          maxBuyPrice: trigger.decodedData[trigger.decodedDataNames.indexOf('maxBuyPrice')],
          deviation: trigger.decodedData[trigger.decodedDataNames.indexOf('deviation')],
          maxBaseFeeInGwei:
            trigger.decodedData[trigger.decodedDataNames.indexOf('maxBaseFeeInGwei')],
        },
      }
    })[0]

  const aaveBasicSell: AaveBasicSell | undefined = triggers.triggers
    .filter((trigger) => trigger.triggerType == AaveBasicSellV2ID)
    .map((trigger) => {
      return {
        triggerTypeName: 'AaveBasicSellV2' as const,
        triggerType: AaveBasicSellV2ID,
        triggerId: trigger.id,
        decodedParams: {
          positionAddress: trigger.decodedData[trigger.decodedDataNames.indexOf('positionAddress')],
          triggerType: trigger.decodedData[trigger.decodedDataNames.indexOf('triggerType')],
          maxCoverage: trigger.decodedData[trigger.decodedDataNames.indexOf('maxCoverage')],
          debtToken: trigger.decodedData[trigger.decodedDataNames.indexOf('debtToken')],
          collateralToken: trigger.decodedData[trigger.decodedDataNames.indexOf('collateralToken')],
          opHash: trigger.decodedData[trigger.decodedDataNames.indexOf('opHash')],
          execLtv: trigger.decodedData[trigger.decodedDataNames.indexOf('execLtv')],
          targetLtv: trigger.decodedData[trigger.decodedDataNames.indexOf('targetLtv')],
          minSellPrice: trigger.decodedData[trigger.decodedDataNames.indexOf('minSellPrice')],
          deviation: trigger.decodedData[trigger.decodedDataNames.indexOf('deviation')],
          maxBaseFeeInGwei:
            trigger.decodedData[trigger.decodedDataNames.indexOf('maxBaseFeeInGwei')],
        },
      }
    })[0]

  const response: GetTriggersResponse = {
    triggers: {
      aaveStopLossToCollateral,
      aaveStopLossToDebt,
      sparkStopLossToCollateral,
      sparkStopLossToDebt,
      aaveBasicBuy,
      aaveBasicSell,
    },
  }

  return ResponseOk({ body: response })
}

export default handler
