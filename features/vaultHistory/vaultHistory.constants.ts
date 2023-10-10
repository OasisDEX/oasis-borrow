import { gql } from 'graphql-request'

export const query = gql`
  query vaultMultiplyHistories($urn: String) {
    allVaultMultiplyHistories(
      filter: { urn: { equalTo: $urn } }
      orderBy: [TIMESTAMP_DESC, LOG_INDEX_DESC]
    ) {
      nodes {
        hash
        txId
        logIndex
        blockId
        blockNumber
        blockHash
        timestamp
        id
        urn
        kind
        marketPrice
        beforeLockedCollateral
        lockedCollateral
        beforeCollateralizationRatio
        collateralizationRatio
        beforeDebt
        debt
        beforeMultiple
        multiple
        beforeLiquidationPrice
        liquidationPrice
        netValue
        oazoFee
        loanFee
        gasFee
        totalFee
        bought
        depositCollateral
        depositDai
        sold
        withdrawnCollateral
        withdrawnDai
        exitCollateral
        exitDai
        collateralAmount
        daiAmount
        rate
        vaultCreator
        depositor
        cdpId
        transferFrom
        transferTo
        collateral
        auctionId
        liqPenalty
        collateralPrice
        coveredDebt
        remainingDebt
        remainingCollateral
        collateralTaken
        ilk
        oraclePrice
        ethPrice
      }
    }
  }
`
export const triggerEventsQuery = gql`
  query triggerEvents($cdpId: BigFloat) {
    allTriggerEvents(
      filter: { cdpId: { equalTo: $cdpId } }
      orderBy: [TIMESTAMP_DESC, LOG_INDEX_DESC]
    ) {
      nodes {
        id
        triggerId
        cdpId
        number
        kind
        eventType
        hash
        timestamp
        triggerData
        commandAddress
        groupId
        groupType
        gasFee
        ethPrice
      }
    }
  }
`
export const triggerEventsQueryUsingProxy = gql`
  query triggerEvents($proxyAddress: String) {
    allTriggerEvents(
      filter: { proxyAddress: { equalTo: $proxyAddress } }
      orderBy: [TIMESTAMP_DESC, LOG_INDEX_DESC]
    ) {
      nodes {
        id
        triggerId
        cdpId
        number
        kind
        eventType
        hash
        timestamp
        triggerData
        commandAddress
        groupId
        groupType
        gasFee
        ethPrice
        proxyAddress
      }
    }
  }
`
