import BigNumber from "bignumber.js"
import { ActionPills } from "components/ActionPills"
import { SidebarSectionProps, SidebarSection } from "components/sidebar/SidebarSection"
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { staticFilesRuntimeUrl } from "helpers/staticPaths"
import { useTranslation } from "next-i18next"
import { ChangeEvent, useMemo, useState } from "react"
import { Grid, Box, Flex, Image } from "theme-ui"
import { OpenVaultAnimation } from "theme/animations"
import DsrDepositDaiFrom from "../components/DsrDepositDaiForm"
import DsrWithdrawDaiFrom from "../components/DsrWithdrawtDaiForm"
import { DsrDepositStage } from "../helpers/dsrDeposit"
import { DsrWithdrawStage } from "../helpers/dsrWithdraw"
import { createPrimaryButtonLabel } from "../utils/functions"

export type DsrSidebarTabOptions = 'depositDai' | 'withdrawDai'

interface DsrSidebarProps {
  onTabChange: (tab: DsrSidebarTabOptions) => void;
  activeTab: DsrSidebarTabOptions
  daiBalance: BigNumber;
  daiBalanceInDsr: BigNumber;
  onDepositAmountChange: (e: ChangeEvent<HTMLInputElement>) => void
  onWithdrawAmountChange: (e: ChangeEvent<HTMLInputElement>) => void
  depositInputValue?: BigNumber;
  withDrawInputValue?: BigNumber;
  onPrimaryButtonClick?: () => void;
  stage: DsrDepositStage | DsrWithdrawStage;
  isLoading: boolean;
}

export default function DsrSideBar({
  onTabChange,
  activeTab,
  daiBalance,
  onDepositAmountChange,
  depositInputValue,
  onPrimaryButtonClick,
  stage,
  daiBalanceInDsr,
  isLoading,
  onWithdrawAmountChange,
  withDrawInputValue
}: DsrSidebarProps) {
  const { t } = useTranslation()

  const action = useMemo(() => {
    return activeTab === 'depositDai' ? 'Deposit' : 'Withdraw'
  }, [activeTab])

  const primaryButtonlabel = useMemo(() => {
    return createPrimaryButtonLabel(stage, activeTab, t)
  }, [stage, activeTab])


  const sidebarSectionProps: SidebarSectionProps = {
    title: t('dsr.titles.manage'),
    content: (
      <Grid gap={3}>
        {isLoading && (
          <Flex
            sx={{
              justifyContent: 'center'
            }}
          >
            <OpenVaultAnimation />
          </Flex>
        )}
        {!isLoading && ['depositSuccess', 'withdrawSuccess'].includes(stage) && (
          <Box>
            <Flex sx={{ justifyContent: 'center', mb: 4 }}>
              <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
            </Flex>
          </Box>
        )}
        {!isLoading && !['depositSuccess', 'withdrawSuccess'].includes(stage) && (
          <>
            <ActionPills
              active={activeTab}
              items={[
                {
                  id: 'depositDai',
                  label: t('dsr.labels.deposit'),
                  action: () => {
                    onTabChange('depositDai')
                  },
                },
                {
                  id: 'withdrawDai',
                  label: t('dsr.labels.withdraw'),
                  action: () => {
                    onTabChange('withdrawDai')
                  },
                },
              ]}
            />
            {activeTab === 'depositDai' && (
              <DsrDepositDaiFrom 
                action={action}
                onDepositAmountChange={onDepositAmountChange}
                amount={depositInputValue}
                maxAmount={daiBalance}           
              />
            )}
            {activeTab === 'withdrawDai' && (
              <DsrWithdrawDaiFrom 
                action={action}
                onWithdrawAmountChange={onWithdrawAmountChange}
                amount={withDrawInputValue}
                maxAmount={daiBalanceInDsr}           
              />
            )}
          </>
        )}
      </Grid>
    ),
    primaryButton: {
      label: primaryButtonlabel,
      action: () => onPrimaryButtonClick && onPrimaryButtonClick(),
      isLoading,
      disabled: isLoading
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}