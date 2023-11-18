import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { getDefaultErrorMessage } from 'shared/helpers'
import { ResponseBadRequest } from 'shared/responses'
import { getAddressFromRequest } from 'shared/validators'
import { MigrationPosition } from 'shared/domain-types'
import { createClient } from './client'

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  //set envs
  const {} = (event.stageVariables as Record<string, string>) || {}

  // validate the query
  let address: string | undefined
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
    let positions: MigrationPosition[] = []
    const assetsByChain = await client.getAssetsByChain()

    assetsByChain.forEach(({ debtAssets, collAssets, chainId, protocolId }) => {
      const hasOneDebtAsset = debtAssets.length === 1
      const hasOneDominantCollAsset = collAssets.length === 1
      const dominantCollAsset = getDominantCollAsset(collAssets)

      if (hasOneDebtAsset && hasOneDominantCollAsset) {
        positions.push({
          chainId,
          protocolId,
          debtAsset: debtAssets[0],
          collAsset: collAssets[0],
        })
      }
    })
  } finally {
  }
}
