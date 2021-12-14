import { trackingEvents } from 'analytics/analytics'
import { ALLOWED_MULTIPLY_TOKENS } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { DefaultVaultHeader } from 'components/vault/DefaultVaultHeader'
import { VaultAllowance, VaultAllowanceStatus } from 'components/vault/VaultAllowance'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { VaultFormVaultTypeSwitch, WithVaultFormStepIndicator } from 'components/vault/VaultForm'
import { VaultFormContainer } from 'components/vault/VaultFormContainer'
import { VaultProxyStatusCard } from 'components/vault/VaultProxy'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useSelectFromContext } from 'helpers/useSelectFromContext'
import { pick } from 'helpers/pick'
import { useObservableWithError } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Container, Grid, Text } from 'theme-ui'

import { OpenVaultState } from '../openVault'
import { createOpenVaultAnalytics$ } from '../openVaultAnalytics'
import { OpenVaultButton } from './OpenVaultButton'
import { OpenVaultConfirmation, OpenVaultStatus } from './OpenVaultConfirmation'
import { OpenVaultDetails } from './OpenVaultDetails'
import { OpenVaultEditing } from './OpenVaultEditing'
import { OpenVaultErrors } from './OpenVaultErrors'
import { OpenVaultWarnings } from './OpenVaultWarnings'

function OpenVaultTitle() {
  const {
    isEditingStage,
    isProxyStage,
    isAllowanceStage,
    token,
    stage,
    totalSteps,
    currentStep,
  } = useSelectFromContext(OpenBorrowVaultContext, (ctx) => ({
    isEditingStage: ctx.isEditingStage,
    isProxyStage: ctx.isProxyStage,
    isAllowanceStage: ctx.isAllowanceStage,
    token: ctx.token,
    stage: ctx.stage,
    totalSteps: ctx.totalSteps,
    currentStep: ctx.currentStep,
  }))
  const { t } = useTranslation()
  return (
    <Box>
      <WithVaultFormStepIndicator {...{ totalSteps, currentStep }}>
        <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', mb: 1 }}>
          {isEditingStage
            ? t('vault-form.header.edit')
            : isProxyStage
            ? t('vault-form.header.proxy')
            : isAllowanceStage
            ? t('vault-form.header.allowance', { token: token.toUpperCase() })
            : stage === 'txInProgress'
            ? t('vault-form.header.confirm-in-progress')
            : t('vault-form.header.confirm')}
        </Text>
      </WithVaultFormStepIndicator>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle', lineHeight: '22px' }}>
        {isEditingStage
          ? t('vault-form.subtext.edit')
          : isProxyStage
          ? t('vault-form.subtext.proxy')
          : isAllowanceStage
          ? t('vault-form.subtext.allowance')
          : stage === 'txInProgress'
          ? t('vault-form.subtext.confirm-in-progress')
          : t('vault-form.subtext.review-manage')}
      </Text>
    </Box>
  )
}

function OpenVaultForm() {
  const {
    isEditingStage,
    isProxyStage,
    isAllowanceStage,
    isOpenStage,
    ilk,
    stage,
    token,
    depositAmount,
    allowanceAmount,
    updateAllowanceAmount,
    setAllowanceAmountUnlimited,
    setAllowanceAmountToDepositAmount,
    setAllowanceAmountCustom,
    selectedAllowanceRadio,
    proxyConfirmations,
    safeConfirmations,
    proxyTxHash,
    etherscan,
    allowanceTxHash,
    id,
    openTxHash,
  } = useSelectFromContext(OpenBorrowVaultContext, (ctx) => ({
    ...pick(
      ctx,
      'isEditingStage',
      'isProxyStage',
      'isAllowanceStage',
      'isOpenStage',
      'ilk',
      'stage',
      'token',
      'depositAmount',
      'allowanceAmount',
      'updateAllowanceAmount',
      'setAllowanceAmountUnlimited',
      'setAllowanceAmountToDepositAmount',
      'setAllowanceAmountCustom',
      'selectedAllowanceRadio',
      'proxyConfirmations',
      'safeConfirmations',
      'proxyTxHash',
      'etherscan',
      'allowanceTxHash',
      'id',
      'openTxHash',
    ),
  }))

  return (
    <VaultFormContainer toggleTitle="Open Vault">
      <OpenVaultTitle />
      {isEditingStage && <OpenVaultEditing />}
      {isAllowanceStage && (
        <VaultAllowance
          stage={stage}
          token={token}
          depositAmount={depositAmount}
          allowanceAmount={allowanceAmount}
          updateAllowanceAmount={updateAllowanceAmount}
          setAllowanceAmountUnlimited={setAllowanceAmountUnlimited}
          setAllowanceAmountToDepositAmount={setAllowanceAmountToDepositAmount}
          setAllowanceAmountCustom={setAllowanceAmountCustom}
          selectedAllowanceRadio={selectedAllowanceRadio}
        />
      )}
      {isOpenStage && <OpenVaultConfirmation stage={stage} />}
      <OpenVaultErrors />
      <OpenVaultWarnings />
      {stage === 'txSuccess' && <VaultChangesWithADelayCard />}
      <OpenVaultButton />
      {isProxyStage && (
        <VaultProxyStatusCard
          stage={stage}
          proxyConfirmations={proxyConfirmations}
          safeConfirmations={safeConfirmations}
          proxyTxHash={proxyTxHash}
          etherscan={etherscan}
        />
      )}
      {isAllowanceStage && (
        <VaultAllowanceStatus
          stage={stage}
          allowanceTxHash={allowanceTxHash}
          etherscan={etherscan}
          token={token}
        />
      )}
      {isOpenStage && (
        <OpenVaultStatus stage={stage} id={id} etherscan={etherscan} openTxHash={openTxHash} />
      )}
      {isEditingStage ? (
        <VaultFormVaultTypeSwitch
          href={`/vaults/open-multiply/${ilk}`}
          title="Switch to Multiply"
          visible={ALLOWED_MULTIPLY_TOKENS.includes(token)}
        />
      ) : null}
    </VaultFormContainer>
  )
}

export function OpenVaultContainer() {
  const { t } = useTranslation()
  const { headerProps, clear } = useSelectFromContext(OpenBorrowVaultContext, (ctx) => ({
    headerProps: {
      ilkData: ctx.ilkData,
      id: ctx.id,
      header: t('vault.open-vault', { ilk: ctx.ilk }),
    },
    clear: ctx.clear,
  }))

  useEffect(() => {
    return () => {
      clear()
    }
  }, [])

  return (
    <>
      <DefaultVaultHeader {...headerProps} />
      <Grid variant="vaultContainer">
        <Box>
          <OpenVaultDetails />
        </Box>
        <Box>
          <OpenVaultForm />
        </Box>
      </Grid>
    </>
  )
}

export const OpenBorrowVaultContext = React.createContext<OpenVaultState | undefined>(undefined)

export function OpenVaultView({ ilk }: { ilk: string }) {
  const { openVault$, accountData$, context$ } = useAppContext()
  const openVaultWithIlk$ = openVault$(ilk)
  const openVaultWithError = useObservableWithError(openVaultWithIlk$)

  useEffect(() => {
    const subscription = createOpenVaultAnalytics$(
      accountData$,
      openVaultWithIlk$,
      context$,
      trackingEvents,
    ).subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <WithErrorHandler error={openVaultWithError.error}>
      <WithLoadingIndicator value={openVaultWithError.value}>
        {(openVault) => (
          <Container variant="vaultPageContainer">
            <OpenBorrowVaultContext.Provider value={openVault}>
              <OpenVaultContainer />
            </OpenBorrowVaultContext.Provider>
          </Container>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
