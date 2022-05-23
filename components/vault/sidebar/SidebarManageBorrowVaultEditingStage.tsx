import { ActionPills } from 'components/ActionPills'
import { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function SidebarManageBorrowVaultEditingStage(props: ManageStandardBorrowVaultState) {
  const { t } = useTranslation()

  const {
    stage,
    setMainAction,
    mainAction,
    // vault: { token },
  } = props

  // const [isGenerateDaiDisabled, setIsGenerateDaiDisabled] = useState<boolean>(true)

  // useEffect(() => {
  //   if (!depositAmount || depositAmount.isZero()) {
  //     setIsGenerateDaiDisabled(true)
  //   } else {
  //     if (!showGenerateOption) toggleGenerateOption!()
  //     setIsGenerateDaiDisabled(false)
  //   }
  // }, [depositAmount])

  return (
    <Grid gap={3}>
      {stage === 'collateralEditing' && (
        <>
          <ActionPills
            active={mainAction}
            items={[
              {
                id: 'depositGenerate',
                label: t('vault-actions.deposit'),
                action: () => {
                  setMainAction!('depositGenerate')
                },
              },
              {
                id: 'withdrawPayback',
                label: t('vault-actions.withdraw'),
                action: () => {
                  setMainAction!('withdrawPayback')
                },
              },
            ]}
          />
        </>
      )}
      {stage === 'daiEditing' && (
        <>
          <ActionPills
            active={mainAction}
            items={[
              {
                id: 'depositGenerate',
                label: t('vault-actions.generate'),
                action: () => {
                  setMainAction!('depositGenerate')
                },
              },
              {
                id: 'withdrawPayback',
                label: t('vault-actions.payback'),
                action: () => {
                  setMainAction!('withdrawPayback')
                },
              },
            ]}
          />
        </>
      )}
    </Grid>
  )
}
