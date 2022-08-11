import { TriggerRecord } from 'features/automation/protection/triggers/AutomationTriggersData'
import { gql, GraphQLClient } from 'graphql-request'
import { useFeatureToggle } from 'helpers/useFeatureToggle'

const queryWithConstantMultiple = gql`
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
  groupId?: number
  commandAddress: string
  triggerData: string
}

// vaultId is string here because gql expects type BigFloat but can only parse string values
export async function getAllActiveTriggers(
  client: GraphQLClient,
  vaultId: string,
): Promise<TriggerRecord[]> {
  const constantMultipleEnabled = useFeatureToggle('ConstantMultiple')
  console.log(`constantMultipleEnabled: ${constantMultipleEnabled}`)
  const data = await client.request<{ allActiveTriggers: { nodes: ActiveTrigger[] } }>(
    constantMultipleEnabled ? queryWithConstantMultiple : query,
    { vaultId },
  )

  const returnedRecords = data.allActiveTriggers.nodes.map((record) => ({
    triggerId: record.triggerId,
    groupId: record.groupId,
    commandAddress: record.commandAddress,
    executionParams: record.triggerData,
  }))

  return returnedRecords
}
