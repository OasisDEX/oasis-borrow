import { AutomationBaseTriggerData } from 'blockchain/calls/automationBot'
import { gql, GraphQLClient } from 'graphql-request'

const query = gql`
query activeTriggersForVault($vaultId: BigFloat){
  allActiveTriggers(
    filter: {cdpId: {equalTo: $vaultId}}
    orderBy: [BLOCK_ID_ASC]) {
  nodes {
    id
    triggerId
    triggerType
    cdpId
    blockId
    triggerData
    txId
    
  }
  }
}
`
// vaultId is string here because gql expects type BigFloat but can only parse string values
async function getAllActiveTriggers(client: GraphQLClient, vaultId: string): Promise<AutomationBaseTriggerData[]> {
    const data = await client.request(query, { cdpId: vaultId })
  
    return data.allActiveTriggers.nodes as AutomationBaseTriggerData[]
  }