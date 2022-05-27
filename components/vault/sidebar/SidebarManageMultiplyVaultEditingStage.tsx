import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { ActionPills } from 'components/ActionPills'
import { ManageMultiplyVaultChangesInformation } from 'features/multiply/manage/containers/ManageMultiplyVaultChangesInformation'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

import { otherActionsCollateralPanel, otherActionsDaiPanel } from './SidebarManageMultiplyVault'

function SidebarManageMultiplyVaultEditingStageClose(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const {
    closeVaultTo,
    setCloseVaultTo,
    afterCloseToCollateral,
    afterCloseToCollateralUSD,
    afterCloseToDai,
    vault: { token },
  } = props

  const isClosingToCollateral = closeVaultTo === 'collateral'
  const closeToTokenSymbol = isClosingToCollateral ? token : 'DAI'

  return (
    <>
      <ActionPills
        active={closeVaultTo}
        items={[
          {
            id: 'collateral',
            label: t('close-to', { token }),
            action: () => {
              setCloseVaultTo!('collateral')
            },
          },
          {
            id: 'dai',
            label: t('close-to', { token: 'DAI' }),
            action: () => {
              setCloseVaultTo!('dai')
            },
          },
        ]}
      />
      <Text as="p" variant="paragraph3" sx={{ mt: 2, color: 'text.subtitle' }}>
        {t('vault-info-messages.closing')}
      </Text>
      <Text
        as="p"
        variant="paragraph3"
        sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, fontWeight: 'semiBold' }}
      >
        <Text as="span" sx={{ display: 'flex', alignItems: 'flex-end', color: 'text.subtitle' }}>
          <Icon name={getToken(closeToTokenSymbol).iconCircle} size="20px" sx={{ mr: 1 }} />
          {t('after-closing', { token: closeToTokenSymbol })}
        </Text>
        <Text as="span">
          {formatCryptoBalance(isClosingToCollateral ? afterCloseToCollateral : afterCloseToDai)}{' '}
          {closeToTokenSymbol}{' '}
          {isClosingToCollateral && `($${formatAmount(afterCloseToCollateralUSD, 'USD')})`}
        </Text>
      </Text>
    </>
  )
}

export function SidebarManageMultiplyVaultEditingStage(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const {
    stage,
    otherAction,
    setOtherAction,
    vault: { debt },
  } = props

  return (
    <Grid gap={3}>
      {stage === 'adjustPosition' && <>Adjust</>}
      {stage === 'otherActions' && (
        <>
          {otherActionsCollateralPanel.includes(otherAction) && (
            <>
              <ActionPills
                active={otherAction}
                items={[
                  {
                    id: 'depositCollateral',
                    label: t('deposit'),
                    action: () => {
                      setOtherAction!('depositCollateral')
                    },
                  },
                  {
                    id: 'withdrawCollateral',
                    label: t('withdraw'),
                    action: () => {
                      setOtherAction!('withdrawCollateral')
                    },
                  },
                ]}
              />
            </>
          )}
          {otherActionsDaiPanel.includes(otherAction) && (
            <>
              <>
                <ActionPills
                  active={otherAction}
                  items={[
                    {
                      id: 'depositDai',
                      label: t('system.actions.multiply.buy-coll'),
                      action: () => {
                        setOtherAction!('depositDai')
                      },
                    },
                    {
                      id: 'paybackDai',
                      label: t('system.actions.multiply.reduce-debt'),
                      action: () => {
                        setOtherAction!('paybackDai')
                      },
                    },
                    {
                      id: 'withdrawDai',
                      label: t('withdraw'),
                      action: () => {
                        setOtherAction!('withdrawDai')
                      },
                    },
                  ]}
                />
              </>
            </>
          )}
          {otherAction === 'closeVault' && debt.isGreaterThan(zero) && debt && (
            <SidebarManageMultiplyVaultEditingStageClose {...props} />
          )}
        </>
      )}

      <ManageMultiplyVaultChangesInformation {...props} />
    </Grid>
  )
}
