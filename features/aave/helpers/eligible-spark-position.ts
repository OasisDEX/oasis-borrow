export const checkElligibleSparkPosition = (
  primaryTokenSymbol: string | undefined,
  secondaryTokenSymbol: string,
) =>
  !!primaryTokenSymbol &&
  !!secondaryTokenSymbol &&
  ['ETH', 'BTC'].includes(primaryTokenSymbol) &&
  secondaryTokenSymbol === 'DAI'
