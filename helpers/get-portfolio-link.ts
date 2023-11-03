import { getLocalAppConfig } from './config'

export const getPortfolioLink = (address?: string) => {
  if (!address) {
    return ''
  }
  const portfolioAddress = getLocalAppConfig('features').NewPortfolio ? 'portfolio' : 'owner'

  return `/${portfolioAddress}/${address}`
}
