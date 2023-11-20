/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { getDefaultErrorMessage } from 'shared/helpers'
import { ResponseBadRequest, ResponseInternalServerError, ResponseOk } from 'shared/responses'
import { getAddressFromRequest } from 'shared/validators'
import {
  Address,
  ChainId,
  PortfolioMigration,
  PortfolioMigrationsResponse,
  ProtocolId,
} from 'shared/domain-types'
import { createClient } from './client'
import { parseEligibleMigration } from './parseEligibleMigration'

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  //set envs
  const { RPC_GATEWAY } = (event.stageVariables as Record<string, string>) || {
    RPC_GATEWAY: process.env.RPC_GATEWAY,
  }

  // validate the query
  let address: Address | undefined
  try {
    address = getAddressFromRequest(event)
  } catch (error) {
    const message = getDefaultErrorMessage(error)
    return ResponseBadRequest(message)
  }

  try {
    if (!RPC_GATEWAY) {
      throw new Error('RPC_GATEWAY env variable is not set')
    }
    const rpcUrl = event.queryStringParameters?.rpcUrl ?? RPC_GATEWAY

    const supportedChainsIds = event.queryStringParameters?.chainIds
      ?.split(',')
      .map(Number) as any as ChainId[] // ?? [
    //   ChainId.MAINNET,
    //   ChainId.ARBITRUM,
    //   ChainId.OPTIMISM,
    //   ChainId.BASE,
    //   ChainId.SEPOLIA,
    // ]
    const supportedProtocolsIds = event.queryStringParameters?.protocolIds?.split(
      ',',
    ) as any as ProtocolId[] // ?? [(ProtocolId.AAVE3, ProtocolId.SPARK)]

    const client = createClient(rpcUrl, supportedChainsIds, supportedProtocolsIds)

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
