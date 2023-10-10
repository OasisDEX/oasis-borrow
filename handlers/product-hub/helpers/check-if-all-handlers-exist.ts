import { PRODUCT_HUB_HANDLERS } from 'handlers/product-hub/update-handlers'
import type { LendingProtocol } from 'lendingProtocols'

export const checkIfAllHandlersExist = (protocols: LendingProtocol[]) => {
  return protocols.filter((protocol) => !PRODUCT_HUB_HANDLERS[protocol])
}
