import { ActionPills } from 'components/ActionPills'
import { ManageMultiplyVaultChangesInformation } from 'features/multiply/manage/containers/ManageMultiplyVaultChangesInformation'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { otherActionsCollateralPanel, otherActionsDaiPanel } from './SidebarManageMultiplyVault'

export function SidebarManageMultiplyVaultEditingStage(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const { stage, otherAction, setOtherAction } = props

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
          {otherAction === 'closeVault' && <>close</>}
        </>
      )}
      {/* <ActionPills
        active={mainAction}
        items={[
          {
            id: 'depositGenerate',
            label: isCollateralEditing ? t('vault-actions.deposit') : t('vault-actions.generate'),
            action: () => {
              setMainAction!('depositGenerate')
            },
          },
          {
            id: 'withdrawPayback',
            label: isCollateralEditing ? t('vault-actions.withdraw') : t('vault-actions.payback'),
            action: () => {
              setMainAction!('withdrawPayback')
            },
          },
        ]}
      /> */}

      <ManageMultiplyVaultChangesInformation {...props} />
    </Grid>
  )
}
