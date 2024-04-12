import type { NetworkNames } from 'blockchain/networks'
import { isSupportedNetwork } from 'blockchain/networks'
import { WithConnection } from 'components/connectWallet'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { PageSEOTags } from 'components/HeadTags'
import { AppLayout } from 'components/layouts/AppLayout'
import { AaveContextProvider, useAaveContext } from 'features/aave'
import { AaveManagePositionView } from 'features/aave/manage/containers/AaveManageView'
import { ManageAaveStateMachineContextProvider } from 'features/aave/manage/contexts'
import type { PositionId } from 'features/aave/types/position-id'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { safeGetAddress } from 'helpers/safeGetAddress'
import type { SparkLendingProtocol } from 'lendingProtocols'
import { checkIfSpark } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'
import { Grid } from 'theme-ui'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const networkOrProduct = ctx.query.networkOrProduct as string
  const version = ctx.query.version as string
  const protocol = `spark${version.toLowerCase()}`

  if (checkIfSpark(protocol) && isSupportedNetwork(networkOrProduct)) {
    return {
      props: {
        ...(await serverSideTranslations(ctx.locale!, ['common'])),
        vault: ctx.query.vault || null,
        network: networkOrProduct,
        protocol: protocol,
      },
    }
  }

  return {
    redirect: {
      permanent: false,
      destination: INTERNAL_LINKS.notFound,
    },
  }
}

function WithSparkStrategy({
  positionId,
  protocol,
  network,
}: {
  positionId: PositionId
  protocol: SparkLendingProtocol
  network: NetworkNames
}) {
  const { push } = useRouter()
  const { t } = useTranslation()

  const { updateStrategyConfig, aaveManageStateMachine, manageViewInfo$ } = useAaveContext(
    protocol,
    network,
  )

  const [info, infoError] = useObservable(manageViewInfo$({ positionId }))

  if (infoError) {
    console.warn(
      `Cannot obtain position information. network: ${network} and positionId`,
      positionId,
      infoError,
    )
    void push(INTERNAL_LINKS.notFound)
    return <></>
  }

  const _updateStrategyConfig = updateStrategyConfig
    ? updateStrategyConfig(positionId, network)
    : undefined
  return (
    <WithErrorHandler error={[infoError]}>
      <WithLoadingIndicator value={[info]} customLoader={<VaultContainerSpinner />}>
        {([_info]) => (
          <ManageAaveStateMachineContextProvider
            machine={aaveManageStateMachine}
            positionId={_info.positionId}
            strategy={_info.strategyConfig}
            proxies={_info.proxiesRelatedWithPosition}
            updateStrategyConfig={_updateStrategyConfig}
          >
            <PageSEOTags
              title="seo.title-product-w-tokens"
              titleParams={{
                product: t(`seo.${_info.strategyConfig.type.toLocaleLowerCase()}.title`),
                protocol: _info.strategyConfig.protocol,
                token1: _info.strategyConfig.tokens.collateral,
                token2: _info.strategyConfig.tokens.debt,
              }}
              description="seo.multiply.description"
              url={`/aave/v3/${positionId}`}
            />
            <Grid gap={0} sx={{ width: '100%' }}>
              <BackgroundLight />
              <AaveManagePositionView
                address={_info.proxiesRelatedWithPosition.walletAddress}
                strategyConfig={_info.strategyConfig}
              />
            </Grid>
          </ManageAaveStateMachineContextProvider>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

function Position({
  vault,
  protocol,
  network,
}: {
  vault: string
  network: NetworkNames
  protocol: SparkLendingProtocol
}) {
  const { replace } = useRouter()

  const address: string | undefined = safeGetAddress(vault)
  const vaultId: number | undefined =
    address !== undefined ? undefined : isNaN(Number(vault)) ? undefined : Number(vault)

  if (address === undefined && vaultId === undefined) {
    void replace(INTERNAL_LINKS.notFound)
  }

  return (
    <AppLayout>
      <ProductContextHandler>
        <GasEstimationContextProvider>
          <AaveContextProvider>
            <WithConnection>
              <WithTermsOfService>
                <WithSparkStrategy
                  positionId={{ walletAddress: address, vaultId, positionAddressType: 'DPM_PROXY' }}
                  protocol={protocol}
                  network={network}
                />
              </WithTermsOfService>
            </WithConnection>
          </AaveContextProvider>
        </GasEstimationContextProvider>
      </ProductContextHandler>
    </AppLayout>
  )
}

export default Position
