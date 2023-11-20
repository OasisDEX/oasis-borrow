export const getPortfolioLink = (address?: string) => {
  if (!address) {
    return ''
  }
  return `/portfolio/${address}`
}
