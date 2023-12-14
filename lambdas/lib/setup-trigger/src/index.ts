/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { ResponseBadRequest, ResponseInternalServerError, ResponseOk } from 'shared/responses'
import {
  eventBodyAaveBasicBuySchema,
  eventBodyAaveBasicSellSchema,
  Issue,
  mapZodResultToValidationResults,
  pathParamsSchema,
} from '~types'
import { Logger } from '@aws-lambda-powertools/logger'
import { buildServiceContainer } from './services'
import { ChainId, ProtocolId } from 'shared/domain-types'

const logger = new Logger({ serviceName: 'setupTriggerFunction' })

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const { RPC_GATEWAY, GET_TRIGGERS_URL } = (event.stageVariables as Record<string, string>) || {
    RPC_GATEWAY: process.env.RPC_GATEWAY,
    GET_TRIGGERS_URL: process.env.GET_TRIGGERS_URL,
  }

  if (!RPC_GATEWAY) {
    logger.error('RPC_GATEWAY is not set')
    return ResponseInternalServerError('RPC_GATEWAY is not set')
  }

  if (!GET_TRIGGERS_URL) {
    logger.error('GET_TRIGGERS_URL is not set')
    return ResponseInternalServerError('GET_TRIGGERS_URL is not set')
  }

  const pathParamsResult = pathParamsSchema.safeParse(event.pathParameters || {})

  if (!pathParamsResult.success) {
    const validationResults = mapZodResultToValidationResults(pathParamsResult)
    logger.warn('Incorrect path params', {
      params: event.pathParameters,
      errors: validationResults.errors,
    })
    return ResponseBadRequest({
      message: 'Validation Errors',
      errors: validationResults.errors,
    })
  }

  if (
    pathParamsResult.data.chainId !== ChainId.MAINNET &&
    pathParamsResult.data.protocol !== ProtocolId.AAVE3 &&
    pathParamsResult.data.trigger !== 'auto-buy'
  ) {
    const errors: Issue[] = [
      {
        code: 'not-supported-chain',
        message: 'Only Mainnet is supported',
        path: ['chainId'],
      },
      {
        code: 'not-supported-protocol',
        message: 'Only AAVE3 protocol is supported',
        path: ['protocol'],
      },
      {
        code: 'not-supported-trigger',
        message: 'Only auto-buy trigger is supported',
        path: ['trigger'],
      },
    ]
    return ResponseBadRequest({
      message: 'Not Supported yet',
      errors,
    })
  }

  const body = JSON.parse(event.body || '{}')

  const bodySchema =
    pathParamsResult.data.trigger === 'auto-buy'
      ? eventBodyAaveBasicBuySchema
      : eventBodyAaveBasicSellSchema

  const parseResult = bodySchema.safeParse(body)
  if (!parseResult.success) {
    const validationResults = mapZodResultToValidationResults(parseResult)
    logger.warn('Incorrect data', {
      params: body,
      errors: validationResults.errors,
    })
    return ResponseBadRequest({
      message: 'Validation Errors',
      errors: validationResults.errors,
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
    pathParamsResult.data.chainId,
    pathParamsResult.data.protocol,
    pathParamsResult.data.trigger,
    RPC_GATEWAY,
    GET_TRIGGERS_URL,
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
      errors: validation.errors,
    })
    return ResponseBadRequest({
      message: 'Validation Errors',
      errors: validation.errors,
    })
  }

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
