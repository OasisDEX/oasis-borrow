import { TriggerRecord } from 'features/automation/protection/triggers/AutomationTriggersData'
import { gql, GraphQLClient } from 'graphql-request'

const query = gql`
  query activeTriggersForVault($vaultId: BigFloat) {
    allActiveTriggers(filter: { cdpId: { equalTo: $vaultId } }, orderBy: [BLOCK_ID_ASC]) {
      nodes {
        triggerId
        commandAddress
        triggerData
      }
    }
  }
`

interface ActiveTrigger {
  triggerId: number
  commandAddress: string
  triggerData: string
}

// vaultId is string here because gql expects type BigFloat but can only parse string values
export async function getAllActiveTriggers(
  client: GraphQLClient,
  vaultId: string,
): Promise<TriggerRecord[]> {
  const data = await client.request<{ allActiveTriggers: { nodes: ActiveTrigger[] } }>(query, {
    vaultId,
  })

  const returnedRecords = data.allActiveTriggers.nodes.map((record) => ({
    triggerId: record.triggerId,
    commandAddress: record.commandAddress,
    executionParams: record.triggerData,
  }))

  return returnedRecords
}
