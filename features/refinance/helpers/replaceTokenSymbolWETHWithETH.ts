export const replaceTokenSymbolWETHWithETH = (tokenSymbol: string) => {
  if (tokenSymbol === 'WETH') {
    return 'ETH'
  }
  return tokenSymbol
}
