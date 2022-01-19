import { AutomationBaseTriggerData } from 'blockchain/calls/automationBot'
import { gql, GraphQLClient } from 'graphql-request'

const query = gql`
query {
    allActiveTriggers(orderBy: [BLOCK_ID_ASC]) {
    nodes {
      id
      triggerId
      triggerType
      cdpId
      blockId
      triggerData
    }
    }
  }`

async function getAllActiveTriggers(client: GraphQLClient): Promise<AutomationBaseTriggerData[]> {
    const data = await client.request(query)
  
    return data.allActiveTriggers.nodes as AutomationBaseTriggerData[]
  }