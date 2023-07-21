import BigNumber from 'bignumber.js'
import { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { zero } from 'helpers/zero'

const defaultResponse = {
  cumulativeDeposit: zero,
  cumulativeWithdraw: zero,
  cumulativeFees: zero,
}

export const getAjnaPositionCumulatives = async (proxy: string) => {
  const { response } = (await loadSubgraph('Ajna', 'getPositionCumulatives', {
    dpmProxyAddress: proxy.toLowerCase(),
  })) as SubgraphsResponses['Ajna']['getPositionCumulatives']

  if (response && 'account' in response && response.account) {
    const accountWithCumulatives = response.account

    return {
      cumulativeDeposit: new BigNumber(accountWithCumulatives.cumulativeDeposit),
      cumulativeWithdraw: new BigNumber(accountWithCumulatives.cumulativeWithdraw),
      cumulativeFees: new BigNumber(accountWithCumulatives.cumulativeFees),
    }
  }

  return defaultResponse
}
