import { aaveV2ProductHubProducts } from './aaveV2Products'
import { ProductHubHandlerResponse } from '../types'
import { productHubEthersProviders } from '../helpers'

export default async function (): ProductHubHandlerResponse {
  const products = aaveV2ProductHubProducts

  const calls = products.map((product) => {
    const call = productHubEthersProviders[product.network]
  })

  return products.map((product) => ({
    ...product,
  }))
}
