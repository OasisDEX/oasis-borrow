import type { PortfolioAssetsReply } from 'features/portfolio/types'
import { useTranslation } from 'react-i18next'
import { Box } from 'theme-ui'
import { useFetch } from 'usehooks-ts'

export const WalletView = ({ address }: { address: string }) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  const { data: portfolioWalletData } = useFetch<PortfolioAssetsReply>(
    `/api/portfolio/wallet/${address}`,
  )
  return (
    <Box>
      <h4>{tPortfolio('wallet-data')}</h4>
      <pre>{JSON.stringify(portfolioWalletData, null, 2)}</pre>
    </Box>
  )
}
