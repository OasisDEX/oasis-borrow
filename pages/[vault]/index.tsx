import BigNumber from 'bignumber.js'
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
    query: { vault: vaultId },
  } = useRouter()

  const vault = useObservable(vault$(new BigNumber(vaultId as string)))

  const account = web3Context?.status === 'connected' 
    ? web3Context.account
    : 'Not connected'

  const token = vault?.token;
  const liquidationPrice = vault?.liquidationPrice ? formatFiatBalance(vault.liquidationPrice) : 0
  const liquidationPenalty = vault?.liquidationPenalty ? formatPercent(vault.liquidationPenalty?.times(100)) : '0%'
  const collateralizationRatio = vault?.collateralizationRatio?.toString()
  const stabilityFee = vault?.stabilityFee ? formatPrecision(vault.stabilityFee, 2) : 0
  const lockedAmount = vault?.collateral ? formatCryptoBalance(vault.collateral) : 0
  const lockedAmountUSD = vault?.collateralPrice ? formatFiatBalance(vault.collateralPrice) : 0
  const availableToWithdraw = vault?.freeCollateral ? formatCryptoBalance(vault.freeCollateral) : 0
  const availableToWithdrawPrice = vault?.freeCollateralPrice ? formatCryptoBalance(vault.freeCollateralPrice) : 0
  const debt = vault?.debt ? formatCryptoBalance(vault?.debt) : '0'
  const debtAvailable = vault?.availableDebt ? formatCryptoBalance(vault?.availableDebt) : 0
    
  return (
    <Grid>
      <Text>Connected Address :: {account}</Text>
      <Text>Vault :: {vaultId}</Text>
      <Heading as="h1">{vault?.ilk} Vault #{vault?.id}</Heading>
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
        <Heading as="h2">Outstanding debt</Heading>
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
