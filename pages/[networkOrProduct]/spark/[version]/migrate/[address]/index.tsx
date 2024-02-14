import type { NetworkNames } from 'blockchain/networks'
import { isSupportedNetwork } from 'blockchain/networks'
import { WithConnection } from 'components/connectWallet'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { PageSEOTags } from 'components/HeadTags'
import { Icon } from 'components/Icon'
import { AppLayout } from 'components/layouts/AppLayout'
import { AaveContextProvider, useAaveContext } from 'features/aave'
import { AaveManagePositionView } from 'features/aave/manage/containers/AaveManageView'
import { ManageAaveStateMachineContextProvider } from 'features/aave/manage/contexts'
import type { PositionId } from 'features/aave/types/position-id'
import { VaultNotice } from 'features/notices/VaultsNoticesView'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { mapAaveLikeProtocol } from 'helpers/getAaveLikeStrategyUrl'
import { useObservable } from 'helpers/observableHook'
import { safeGetAddress } from 'helpers/safeGetAddress'
import { checkIfSpark, type SparkLendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'
import { warning } from 'theme/icons'
import { Grid } from 'theme-ui'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const networkOrProduct = ctx.query.networkOrProduct as string
  const version = ctx.query.version as string
  const protocol = `spark${version.toLowerCase()}`

  if (checkIfSpark(protocol) && isSupportedNetwork(networkOrProduct)) {
    return {
      props: {
        ...(await serverSideTranslations(ctx.locale!, ['common'])),
        address: ctx.query.address || null,
        network: networkOrProduct,
        protocol: protocol,
      },
    }
  }

  return {
    redirect: {
      permanent: false,
      destination: '/not-found',
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
  const { t } = useTranslation()

  const { updateStrategyConfig, aaveManageStateMachine, manageViewInfoExternal$ } = useAaveContext(
    protocol,
    network,
  )

  const [info, infoError] = useObservable(manageViewInfoExternal$({ positionId }))

  if (infoError) {
    console.warn(
      `Cannot obtain position information. network: ${network} and positionId`,
      positionId,
      infoError,
    )
    return (
      <Grid gap={0} sx={{ width: '100%' }}>
        <BackgroundLight />
        <VaultNotice
          status={<Icon size="34px" icon={warning} />}
          withClose={false}
          header={'No positions to migrate'}
          subheader={'No positions to migrate'}
          color="primary100"
        />
      </Grid>
    )
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
              url={`/aave/${mapAaveLikeProtocol(_info.strategyConfig.protocol)}/${positionId}`}
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
  address,
  protocol,
  network,
}: {
  address: string
  network: NetworkNames
  protocol: SparkLendingProtocol
}) {
  const { replace } = useRouter()

  const walletAddress: string | undefined = safeGetAddress(address)

  if (walletAddress === undefined) {
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
                  positionId={{ walletAddress: address, vaultId: undefined, external: true }}
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
