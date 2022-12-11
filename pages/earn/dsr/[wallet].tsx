import { WithWalletConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { DsrViewContainer } from 'features/dsr/containers/DsrViewContainer'
import { Survey } from 'features/survey'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { BackgroundLight } from 'theme/BackgroundLight'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      walletAddress: ctx.query.wallet || null,
    },
  }
}

function Dsr({ walletAddress }: { walletAddress: string }) {
  return (
    <WithWalletConnection>
      <WithTermsOfService>
        <BackgroundLight />
        <DsrViewContainer walletAddress={walletAddress} />
        <Survey for="earn" />
      </WithTermsOfService>
    </WithWalletConnection>
  )
}

Dsr.layout = AppLayout

export default Dsr
