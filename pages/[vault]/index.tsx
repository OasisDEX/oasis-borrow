import { useAppContext } from 'components/AppContextProvider'
import { AppLayout } from 'components/Layouts'
import { formatCryptoBalance, formatFiatBalance, formatPercent, formatPrecision } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useRouter } from 'next/router'
import { Box,Button, Grid, Heading, Text } from 'theme-ui'

export default function Vault() {
  const { web3Context$, vault$ } = useAppContext()
  const web3Context = useObservable(web3Context$)
  const {
    query: { vault },
  } = useRouter()

  const vaultData = useObservable(vault$(vault as string))

  console.log({ vaultData })

  const account = web3Context?.status === 'connected' 
    ? web3Context.account
    : 'Not connected'

  const token = vaultData?.token;
  const liquidationPrice = vaultData?.liquidationPrice ? formatFiatBalance(vaultData.liquidationPrice) : 0
  const liquidationPenalty = vaultData?.liquidationPenalty ? formatPercent(vaultData.liquidationPenalty?.times(100)) : '0%'
  const collateralizationRatio = vaultData?.collateralizationRatio?.toString()
  const stabilityFee = vaultData?.stabilityFee ? formatPrecision(vaultData.stabilityFee, 2) : 0
  const lockedAmount = vaultData?.collateral ? formatCryptoBalance(vaultData.collateral) : 0
  const lockedAmountUSD = vaultData?.collateralPrice ? formatFiatBalance(vaultData.collateralPrice) : 0
  const availableToWithdraw = vaultData?.collateralAvailable ? formatCryptoBalance(vaultData.collateralPrice) : 0
  const availableToWithdrawPrice = vaultData?.collateralAvailablePrice ? formatCryptoBalance(vaultData.collateralAvailablePrice) : 0
  const debt = vaultData?.debt ? formatCryptoBalance(vaultData?.debt) : '0'
  const debtAvailable = vaultData?.debtAvailable ? formatCryptoBalance(vaultData?.debtAvailable) : 0
    
  return (
    <Grid>
      <Text>Connected Address :: {account}</Text>
      <Text>Vault :: {vault}</Text>
      <Heading as="h1">{vaultData?.ilk} Vault #{vaultData?.id}</Heading>
      <Box>
        <Heading as="h2">Liquidation price</Heading>
        <Text>Liquidation price: {liquidationPrice} USD</Text>
        <Text>Liquidation penalty: {liquidationPenalty}</Text>
      </Box>
      <Box>
        <Heading as="h2">Collateralization Ratio</Heading>
        <Text>Collateralization Ratio: {collateralizationRatio}</Text>
        <Text>Stability fee: {stabilityFee}%</Text>
      </Box>
      <Box>
        <Heading as="h2">{token} locked</Heading>
        <Text>{token} locked: {lockedAmount}{token}/{lockedAmountUSD}USD</Text>
        <Button>Deposit</Button>
        <Text>Available to withdraw: {availableToWithdraw}{token}/{availableToWithdrawPrice}USD</Text>
        <Button>Withdraw</Button>
      </Box>
      <Box>
        <Heading>Outstanding debt</Heading>
        <Text>Outstanding Dai debt {debt}DAI</Text>
        <Text>Available to generate {debtAvailable}DAI</Text>
      </Box>
    </Grid>
  )
}

Vault.layout = AppLayout
Vault.layoutProps = {
  backLink: {
    href: '/',
  },
}
