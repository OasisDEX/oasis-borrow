import { CloseVaultCard } from 'components/vault/CloseVaultCard'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Divider, Flex, Grid, Text } from 'theme-ui'

import { ManageMultiplyVaultState } from '../../../../multiply/manage/pipes/manageMultiplyVault'
import { GuniManageMultiplyVaultChangesInformation } from './GuniManageMultiplyVaultChangesInformation'

function CloseVaultAction(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()
  const {
    setCloseVaultTo,
    closeVaultTo,
    vault: { token },
    afterCloseToDai,
    afterCloseToCollateral,
    afterCloseToCollateralUSD,
  } = props

  const closeToCollateral = closeVaultTo === 'collateral'
  const closeToTokenName = closeToCollateral ? token : 'DAI'

  return (
    <>
      <Grid columns={1}>
        <CloseVaultCard
          optionName="dai"
          text="Close to DAI"
          icon="dai_circle_color"
          onClick={() => setCloseVaultTo!('dai')}
          isActive={!closeToCollateral}
        />
      </Grid>
      <Text variant="paragraph3" sx={{ color: 'neutral80', mt: 3 }}>
        {t('vault-info-messages.closing')}
      </Text>
      <Flex sx={{ fontSize: 1, fontWeight: 'semiBold', justifyContent: 'space-between', mt: 3 }}>
        <Text sx={{ color: 'neutral80' }}>Minimum {closeToTokenName} after closing</Text>
        <Text>
          {formatCryptoBalance(closeToCollateral ? afterCloseToCollateral : afterCloseToDai)}{' '}
          {closeToTokenName}
          {` `}
          {closeToCollateral && (
            <Text as="span" sx={{ color: 'neutral80' }}>
              (${formatAmount(afterCloseToCollateralUSD, 'USD')})
            </Text>
          )}
        </Text>
      </Flex>
    </>
  )
}

function OtherActionsForm(props: ManageMultiplyVaultState) {
  return (
    <Grid>
      <CloseVaultAction {...props} />
    </Grid>
  )
}

export function GuniManageMultiplyVaultEditing(props: ManageMultiplyVaultState) {
  const {
    inputAmountsEmpty,
    vault: { debt },
  } = props

  return (
    <Grid gap={4}>
      {/* TODO here stage has to be already on otherAction and closeVault value to DAI */}
      {/* originalEditingStage === 'otherActions' && otherAction === 'closeVault' */}
      <OtherActionsForm {...props} />
      {!inputAmountsEmpty && <Divider />}
      {!debt.isZero() && <GuniManageMultiplyVaultChangesInformation {...props} />}
    </Grid>
  )
}
