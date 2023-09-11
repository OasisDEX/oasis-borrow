import { isSupportedNetwork, NetworkNames, networksByName } from 'blockchain/networks'
import { WithConnection } from 'components/connectWallet'
import { ProductContextHandler } from 'components/context'
import { PageSEOTags } from 'components/HeadTags'
import { AppLayout } from 'components/layouts'
import { getAddress } from 'ethers/lib/utils'
import { AaveContextProvider, useAaveContext } from 'features/aave'
import { ManageAaveStateMachineContextProvider } from 'features/aave/manage/containers/AaveManageStateMachineContext'
import { AaveManagePositionView } from 'features/aave/manage/containers/AaveManageView'
import { PositionId } from 'features/aave/types/position-id'
import { VaultType } from 'features/generalManageVault/vaultType'
import { useApiVaults } from 'features/shared/vaultApi'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { checkIfSpark, SparkLendingProtocol } from 'lendingProtocols'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React from 'react'
import { Grid } from 'theme-ui'
import { BackgroundLight } from 'theme/BackgroundLight'

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
  const { push } = useRouter()
  const { t } = useTranslation()
  const chainId = networksByName[network].id

  const apiVaults = useApiVaults({ vaultIds: [positionId.vaultId ?? -1], protocol, chainId })

  const {
    strategyConfig$,
    updateStrategyConfig,
    aaveManageStateMachine,
    proxiesRelatedWithPosition$,
  } = useAaveContext(protocol, network)
  const [strategyConfig, strategyConfigError] = useObservable(
    /* If VaultType.Unknown specified then when loading config it'll try to respect position created type */
    strategyConfig$(positionId, network, apiVaults[0]?.type || VaultType.Unknown),
  )
  const [proxiesRelatedWithPosition, proxiesRelatedWithPositionError] = useObservable(
    proxiesRelatedWithPosition$(positionId),
  )

  if (strategyConfigError) {
    console.warn(
      `Strategy config not found for network: ${network} and positionId`,
      positionId,
      strategyConfigError,
    )
    void push(INTERNAL_LINKS.notFound)
    return <></>
  }

  const _updateStrategyConfig = updateStrategyConfig
    ? updateStrategyConfig(positionId, network)
    : undefined
  return (
    <WithErrorHandler error={[strategyConfigError, proxiesRelatedWithPositionError]}>
      <WithLoadingIndicator
        value={[strategyConfig, proxiesRelatedWithPosition]}
        customLoader={<VaultContainerSpinner />}
      >
        {([_strategyConfig, _proxies]) => (
          <ManageAaveStateMachineContextProvider
            machine={aaveManageStateMachine}
            positionId={positionId}
            strategy={_strategyConfig}
            updateStrategyConfig={_updateStrategyConfig}
          >
            <PageSEOTags
              title="seo.title-product-w-tokens"
              titleParams={{
                product: t(`seo.${_strategyConfig.type.toLocaleLowerCase()}.title`),
                protocol: _strategyConfig.protocol,
                token1: _strategyConfig.tokens.collateral,
                token2: _strategyConfig.tokens.debt,
              }}
              description="seo.multiply.description"
              url={`/aave/v3/${positionId}`}
            />
            <Grid gap={0} sx={{ width: '100%' }}>
              <BackgroundLight />
              <AaveManagePositionView
                address={_proxies.walletAddress}
                strategyConfig={_strategyConfig}
              />
            </Grid>
          </ManageAaveStateMachineContextProvider>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

function safeGetAddress(address: string | undefined) {
  if (address) {
    try {
      return getAddress(address)
    } catch (e) {
      return undefined
    }
  }
  return undefined
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
    <ProductContextHandler>
      <AaveContextProvider>
        <WithConnection>
          <WithTermsOfService>
            <WithSparkStrategy
              positionId={{ walletAddress: address, vaultId }}
              protocol={protocol}
              network={network}
            />
          </WithTermsOfService>
        </WithConnection>
      </AaveContextProvider>
    </ProductContextHandler>
  )
}

Position.layout = AppLayout

export default Position
