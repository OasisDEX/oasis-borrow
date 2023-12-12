import { sparkV3ProductHubProducts } from 'handlers/product-hub/update-handlers/sparkV3/sparkV3Products'

const tokenGroups = ['ETH', 'BTC']

const isInTokenGroups = (tokenSymbol: string) => {
  const group = sparkV3ProductHubProducts.find(
    (product) => product.primaryToken === tokenSymbol,
  )?.primaryTokenGroup
  return group && tokenGroups.includes(group)
}

export const checkElligibleSparkPosition = (
  primaryTokenSymbol: string | undefined,
  secondaryTokenSymbol: string,
) =>
  !!primaryTokenSymbol &&
  !!secondaryTokenSymbol &&
  isInTokenGroups(primaryTokenSymbol) &&
  secondaryTokenSymbol === 'DAI'
