import { WithConnection } from 'components/connectWallet'
import { PageSEOTags } from 'components/HeadTags'
import { AppLayout } from 'components/Layouts'
import { getAddress } from 'ethers/lib/utils'
import { AaveContextProvider, useAaveContext } from 'features/aave/AaveContextProvider'
import { ManageAaveStateMachineContextProvider } from 'features/aave/manage/containers/AaveManageStateMachineContext'
import { AaveManagePositionView } from 'features/aave/manage/containers/AaveManageView'
import { PositionId } from 'features/aave/types'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { LendingProtocol } from 'lendingProtocols'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React from 'react'
import { Grid } from 'theme-ui'
import { BackgroundLight } from 'theme/BackgroundLight'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      vault: ctx.query.vault || null,
    },
  }
}

function WithStrategy(positionId: PositionId) {
  const { t } = useTranslation()
  const { strategyConfig$, aaveManageStateMachine, proxiesRelatedWithPosition$ } = useAaveContext(
    LendingProtocol.AaveV2,
  )
  const [strategyConfig, strategyConfigError] = useObservable(strategyConfig$(positionId))
  const [proxiesRelatedWithPosition, proxiesRelatedWithPositionError] = useObservable(
    proxiesRelatedWithPosition$(positionId),
  )
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

function Position({ vault }: { vault: string }) {
  const { replace } = useRouter()

  const address: string | undefined = safeGetAddress(vault)
  const vaultId: number | undefined =
    address !== undefined ? undefined : isNaN(Number(vault)) ? undefined : Number(vault)

  if (address === undefined && vaultId === undefined) {
    void replace(INTERNAL_LINKS.homepage)
  }

  return (
    <AaveContextProvider>
      <WithConnection>
        <WithTermsOfService>
          <WithStrategy walletAddress={address} vaultId={vaultId} />
        </WithTermsOfService>
      </WithConnection>
    </AaveContextProvider>
  )
}

Position.layout = AppLayout

export default Position
