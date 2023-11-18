import { SUPPORTED_PROTOCOL_IDS, SUPPORTED_PROXY_IDS } from 'shared/debank-helpers'
import { DebankComplexProtocol } from 'shared/debank-types'

export function getSupportedPositions(json: DebankComplexProtocol[]) {
  return (
    json
      // filter out non-supported protocols
      .filter(({ id }) => {
        const isSupportedProtocol = SUPPORTED_PROTOCOL_IDS.includes(id)
        return isSupportedProtocol
      })
      // map each protocol to position array and filter out non-supported positions
      .map(({ portfolio_item_list }) =>
        (portfolio_item_list || []).filter(({ proxy_detail }) =>
          SUPPORTED_PROXY_IDS.includes(proxy_detail?.project?.id ?? ''),
        ),
      )
      // flatten positions array
      .flat()
  )
}
