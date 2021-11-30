import { CloseVaultCard } from 'components/vault/CloseVaultCard'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import React from 'react'
import { Divider, Flex, Grid, Text } from 'theme-ui'

import { ManageMultiplyVaultState } from '../../../../manageMultiplyVault/manageMultiplyVault'
import { GuniManageMultiplyVaultChangesInformation } from './GuniManageMultiplyVaultChangesInformation'

function CloseVaultAction(props: ManageMultiplyVaultState) {
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
          text="Close to DAI"
          icon="dai_circle_color"
          onClick={() => setCloseVaultTo!('dai')}
          isActive={!closeToCollateral}
        />
      </Grid>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle', mt: 3 }}>
        To close your vault, a part of your position will be sold to payback the outstanding debt.
        The rest of your collateral will be send to your address.
      </Text>
      <Flex sx={{ fontSize: 1, fontWeight: 'semiBold', justifyContent: 'space-between', mt: 3 }}>
        <Text sx={{ color: 'text.subtitle' }}>Minimum {closeToTokenName} after closing</Text>
        <Text>
          {formatCryptoBalance(closeToCollateral ? afterCloseToCollateral : afterCloseToDai)}{' '}
          {closeToTokenName}
          {` `}
          {closeToCollateral && (
            <Text as="span" sx={{ color: 'text.subtitle' }}>
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
  const { inputAmountsEmpty } = props

  return (
    <Grid gap={4}>
      {/* TODO here stage has to be already on otherAction and closeVault value to DAI */}
      {/* originalEditingStage === 'otherActions' && otherAction === 'closeVault' */}
      <OtherActionsForm {...props} />
      {!inputAmountsEmpty && <Divider />}
      <GuniManageMultiplyVaultChangesInformation {...props} />
    </Grid>
  )
}
