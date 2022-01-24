import { TriggerRecord } from 'features/automation/triggers/AutomationTriggersData'
import { gql, GraphQLClient } from 'graphql-request'
import { List } from 'lodash'

const query = gql`
  query activeTriggersForVault($vaultId: BigFloat) {
    allActiveTriggers(filter: { cdpId: { equalTo: $vaultId } }, orderBy: [BLOCK_ID_ASC]) {
      nodes {
        triggerId
        triggerType
        triggerData
  
      }
    }
  }
`
// vaultId is string here because gql expects type BigFloat but can only parse string values
export async function getAllActiveTriggers(
  client: GraphQLClient,
  vaultId: string,
): Promise<List<TriggerRecord>> {

  const data = await client.request(query, { vaultId: vaultId })

  let returnedRecords = [] as TriggerRecord[]
  data.allActiveTriggers.nodes.forEach((record: { triggerId: number; triggerType: number; triggerData: string }) => {
    returnedRecords.push({
      triggerId: record.triggerId,
      triggerType: record.triggerType,
      executionParams: record.triggerData
    })
  }); {
    
  }

  return returnedRecords
}
