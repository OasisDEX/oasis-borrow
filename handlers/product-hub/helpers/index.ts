import { ProductHubItems } from '@prisma/client'
import { PRODUCT_HUB_HANDLERS } from 'handlers/product-hub/update-handlers'
import { LendingProtocol } from 'lendingProtocols'

// removing the ID cause it's not needed in the frontend
export const filterTableData = ({ id, ...table }: ProductHubItems) => table

export const checkIfAllHandlersExist = (protocols: LendingProtocol[]) => {
  return protocols.filter((protocol) => !PRODUCT_HUB_HANDLERS[protocol])
}
