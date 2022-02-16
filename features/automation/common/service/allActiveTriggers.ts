import { TriggerRecord } from 'features/automation/triggers/AutomationTriggersData'
import { gql, GraphQLClient } from 'graphql-request'
import { List } from 'lodash'

const query = gql`
  query activeTriggersForVault($vaultId: BigFloat) {
    allActiveTriggers(filter: { cdpId: { equalTo: $vaultId } }, orderBy: [BLOCK_ID_ASC]) {
      nodes {
        triggerId
        triggerData
      }
    }
  }
`

interface ActiveTrigger {
  triggerId: number
  triggerData: string
}

// vaultId is string here because gql expects type BigFloat but can only parse string values
export async function getAllActiveTriggers(
  client: GraphQLClient,
  vaultId: string,
): Promise<List<TriggerRecord>> {
  const data = await client.request<{ allActiveTriggers: { nodes: ActiveTrigger[] } }>(query, {
    vaultId,
  })

  const returnedRecords = data.allActiveTriggers.nodes.map((record) => ({
    triggerId: record.triggerId,
    executionParams: record.triggerData,
  }))

  return returnedRecords
}
