import { z } from 'zod'
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { getDefaultErrorMessage } from 'shared/helpers'
import { ResponseBadRequest, ResponseInternalServerError, ResponseOk } from 'shared/responses'
import { chainIdsSchema, protocolIdsSchema, addressSchema } from 'shared/validators'
import {
  Address,
  ChainId,
  PortfolioMigration,
  PortfolioMigrationsResponse,
  ProtocolId,
} from 'shared/domain-types'
import { createClient } from './client'
import { parseEligibleMigration } from './parseEligibleMigration'
import { MIGRATION_SUPPORTED_CHAIN_IDS, MIGRATION_SUPPORTED_PROTOCOL_IDS } from 'shared/constants'

const paramsSchema = z.object({
  address: addressSchema,
  chainIds: chainIdsSchema.optional(),
  protocolIds: protocolIdsSchema.optional(),
  rpcUrl: z.string().optional(),
})

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  //set envs
  const { RPC_GATEWAY } = (event.stageVariables as Record<string, string>) || {
    RPC_GATEWAY: process.env.RPC_GATEWAY,
  }

  // params
  let address: Address | undefined
  let chainIds: ChainId[] | undefined
  let protocolIds: ProtocolId[] | undefined
  let rpcUrl: string | undefined

  // validation
  try {
    const params = paramsSchema.parse(event.queryStringParameters)
    address = params.address
    chainIds = params.chainIds
    protocolIds = params.protocolIds
    rpcUrl = params.rpcUrl
  } catch (error) {
    console.log(error)
    const message = getDefaultErrorMessage(error)
    return ResponseBadRequest(message)
  }

  try {
    if (!RPC_GATEWAY) {
      throw new Error('RPC_GATEWAY env variable is not set')
    }
    const rpcUrlWithFallback = rpcUrl ?? RPC_GATEWAY

    const supportedChainsIds = chainIds ?? MIGRATION_SUPPORTED_CHAIN_IDS
    const supportedProtocolsIds = protocolIds ?? MIGRATION_SUPPORTED_PROTOCOL_IDS

    const client = createClient(rpcUrlWithFallback, supportedChainsIds, supportedProtocolsIds)

    let eligibleMigrations: PortfolioMigration[] = []
    const protocolAssetsToMigrate = await client.getProtocolAssetsToMigrate(address)

    protocolAssetsToMigrate.forEach((protocolAssets) => {
      const eligibleMigration = parseEligibleMigration(protocolAssets)
      if (eligibleMigration) {
        eligibleMigrations.push(eligibleMigration)
      }
    })

    return ResponseOk<PortfolioMigrationsResponse>({ body: { migrations: eligibleMigrations } })
  } catch (error) {
    console.error(error)
    return ResponseInternalServerError()
  }
}

export default handler
