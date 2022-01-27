import { TriggerRecord } from 'features/automation/triggers/AutomationTriggersData'
import { gql, GraphQLClient } from 'graphql-request'
import { List } from 'lodash'

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
// vaultId is string here because gql expects type BigFloat but can only parse string values
export async function getAllActiveTriggers(
  client: GraphQLClient,
  vaultId: string,
): Promise<List<TriggerRecord>> {
  const data = await client.request(query, { vaultId: vaultId })
  console.log('data returned from gql')
  console.log(data)

  const returnedRecords = data.allActiveTriggers.nodes.map(
    (record: { triggerId: number; commandAddress: string; triggerData: string }) => {
      return {
        triggerId: record.triggerId,
        commandAddress: record.commandAddress,
        executionParams: record.triggerData,
      }
    },
  )
  console.log('returned records after map')
  console.log(returnedRecords)
  return returnedRecords
}
