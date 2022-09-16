import { TriggerRecord } from 'features/automation/api/automationTriggersData'
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
  const data = await client.request<{ allActiveTriggers: { nodes: ActiveTrigger[] } }>(
    constantMultipleEnabled ? queryWithConstantMultiple : query,
    { vaultId },
  )

  return data.allActiveTriggers.nodes.map((record) => ({
    triggerId: record.triggerId,
    groupId: record.groupId,
    commandAddress: record.commandAddress,
    executionParams: record.triggerData,
  }))
}
