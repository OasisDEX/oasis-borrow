/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { getDefaultErrorMessage } from 'shared/helpers'
import { ResponseBadRequest, ResponseInternalServerError, ResponseOk } from 'shared/responses'
import { getAddressFromRequest } from 'shared/validators'
import { Address, PortfolioMigration, PortfolioMigrationsResponse } from 'shared/domain-types'
import { createClient } from './client'
import { parseEligibleMigration } from './parseEligibleMigration'

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  //set envs
  // const {} = (event.stageVariables as Record<string, string>) || {}

  // validate the query
  let address: Address | undefined
  try {
    address = getAddressFromRequest(event)
  } catch (error) {
    const message = getDefaultErrorMessage(error)
    return ResponseBadRequest(message)
  }

  const rpcUrl =
    event.queryStringParameters?.rpcUrl ??
    'https://ps5xep63x8.execute-api.eu-central-1.amazonaws.com/staging'

  const client = createClient(rpcUrl)

  try {
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
