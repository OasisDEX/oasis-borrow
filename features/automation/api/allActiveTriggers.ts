import type { GraphQLClient } from 'graphql-request'
import { gql } from 'graphql-request'

import type { TriggerRecord } from './automationTriggersData.types'

const query = gql`
  query activeTriggersForVault($vaultId: BigFloat) {
    allActiveTriggers(filter: { cdpId: { equalTo: $vaultId } }, orderBy: [BLOCK_ID_ASC]) {
      nodes {
        triggerId
        groupId
        commandAddress
        triggerData
      }
    }
  }
`

const queryV2 = gql`
  query activeTriggersV2ForVault($proxyAddress: String) {
    allActiveTriggers(
      filter: { proxyAddress: { equalTo: $proxyAddress } }
      orderBy: [BLOCK_ID_ASC]
    ) {
      nodes {
        triggerId
        groupId
        commandAddress
        triggerData
        proxyAddress
      }
    }
  }
`

interface ActiveTrigger {
  triggerId: number
  groupId?: number
  commandAddress: string
  triggerData: string
  proxyAddress: string
}

// vaultId is string here because gql expects type BigFloat but can only parse string values
export async function getAllActiveTriggers(
  client: GraphQLClient,
  vaultId: string,
  proxyAddress?: string,
): Promise<TriggerRecord[]> {
  const data = proxyAddress
    ? await client.request<{ allActiveTriggers: { nodes: ActiveTrigger[] } }>(queryV2, {
        proxyAddress: proxyAddress.toLowerCase(),
      })
    : await client.request<{ allActiveTriggers: { nodes: ActiveTrigger[] } }>(query, {
        vaultId,
      })

  return data.allActiveTriggers.nodes.map((record) => ({
    triggerId: record.triggerId,
    groupId: record.groupId,
    commandAddress: record.commandAddress,
    executionParams: record.triggerData,
    proxyAddress: record.proxyAddress,
  }))
}
