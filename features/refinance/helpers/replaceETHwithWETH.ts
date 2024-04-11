export const replaceETHWithWETH = (symbol: string) => {
  if (symbol === 'ETH') {
    return 'WETH'
  }
  return symbol
}
