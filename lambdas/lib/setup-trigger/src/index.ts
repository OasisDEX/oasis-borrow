/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { ResponseBadRequest, ResponseInternalServerError, ResponseOk } from 'shared/responses'
import { eventBodyAaveBasicBuySchema, eventBodyAaveBasicSellSchema, pathParamsSchema } from '~types'
import { Logger } from '@aws-lambda-powertools/logger'
import { buildServiceContainer } from './services'
import { ChainId, ProtocolId } from 'shared/domain-types'

const logger = new Logger({ serviceName: 'setupTriggerFunction' })

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  //set envs
  const { RPC_GATEWAY, SUBGRAPH_BASE } = (event.stageVariables as Record<string, string>) || {
    RPC_GATEWAY: process.env.RPC_GATEWAY,
    SUBGRAPH_BASE: process.env.SUBGRAPH_BASE,
  }

  if (!RPC_GATEWAY) {
    logger.error('RPC_GATEWAY is not set')
    return ResponseInternalServerError('RPC_GATEWAY is not set')
  }

  if (!SUBGRAPH_BASE) {
    logger.error('SUBGRAPH_BASE is not set')
    return ResponseInternalServerError('SUBGRAPH_BASE is not set')
  }

  const parsePathResult = pathParamsSchema.safeParse(event.pathParameters)
  if (!parsePathResult.success) {
    logger.warn('Incorrect path params', {
      params: event.pathParameters,
      errors: parsePathResult.error.errors,
    })
    return ResponseBadRequest({
      message: 'Validation Errors',
      errors: parsePathResult.error.errors,
    })
  }

  if (
    parsePathResult.data.chainId !== ChainId.MAINNET &&
    parsePathResult.data.protocol !== ProtocolId.AAVE3 &&
    parsePathResult.data.trigger !== 'auto-buy'
  ) {
    return ResponseBadRequest({
      message: 'Not Supported yet',
      errors: [
        'Only AAVE3 protocol is supported',
        'Only auto-buy trigger is supported',
        'Only Mainnet is supported',
      ],
    })
  }

  const body = JSON.parse(event.body || '{}')

  const bodySchema =
    parsePathResult.data.trigger === 'auto-buy'
      ? eventBodyAaveBasicBuySchema
      : eventBodyAaveBasicSellSchema

  const parseResult = bodySchema.safeParse(body)
  if (!parseResult.success) {
    logger.warn('Incorrect data', {
      params: body,
      errors: parseResult.error.errors,
    })
    return ResponseBadRequest({
      message: 'Validation Errors',
      errors: parseResult.error.errors,
    })
  }

  const params = parseResult.data

  const {
    getPosition,
    getExecutionPrice,
    simulatePosition,
    encodeTrigger,
    encodeForDPM,
    validate,
  } = buildServiceContainer(
    parsePathResult.data.chainId,
    parsePathResult.data.protocol,
    parsePathResult.data.trigger,
    RPC_GATEWAY,
    SUBGRAPH_BASE,
    params.rpc,
    logger,
  )

  const position = await getPosition({
    dpm: params.dpm,
    collateral: params.position.collateral,
    debt: params.position.debt,
  })

  const executionPrice = getExecutionPrice(position)

  const validation = validate({
    position,
    executionPrice,
    triggerData: params.triggerData,
  })

  if (!validation.success) {
    logger.warn('Validation Errors', {
      errors: validation.error,
    })
    return ResponseBadRequest({
      message: 'Validation Errors',
      errors: validation.error,
    })
  }

  logger.info(`Calculated Values for position`, { position, executionPrice })

  const { encodedTrigger, encodedTriggerData } = await encodeTrigger(position, params.triggerData)

  const simulation = simulatePosition({
    position: position,
    executionLTV: params.triggerData.executionLTV,
    executionPrice: executionPrice,
    targetLTV: params.triggerData.targetLTV,
  })

  const transaction = encodeForDPM({
    dpm: params.dpm,
    encodedTrigger,
  })

  return ResponseOk({
    body: {
      simulation,
      transaction,
      encodedTriggerData,
    },
  })
}

export default handler
