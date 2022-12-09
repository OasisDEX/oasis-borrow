import BigNumber from "bignumber.js";
import { TabBar } from "components/TabBar";
import { VaultHeadline } from 'components/vault/VaultHeadline';
import { AaveFaq } from "features/content/faqs/aave";
import { formatPercent } from "helpers/formatters/format";
import { Loadable } from "helpers/loadable";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";
import { Grid, Box, Card } from "theme-ui";
import DsrDetailsSection from "../components/DsrDetailsSection";
import { DsrDepositState } from "../helpers/dsrDeposit";
import { DsrPot } from "../helpers/dsrPot";
import { DsrWithdrawState } from "../pipes/dsrWithdraw";
import DsrSideBar, { DsrSidebarTabOptions } from "../sidebar/DsrSideBar";
import { selectPrimaryAction } from "../utils/functions";
import {  handleAmountChange } from '../utils/formUtils';
import React from 'react';

interface DsrViewProps {
  dsrOverview: Loadable<DsrPot>;
  dsrDepostis: DsrDepositState;
  dsrWithdraws: DsrWithdrawState;
  activeTab: DsrSidebarTabOptions;
  setActiveTab: (tab: DsrSidebarTabOptions) => void
}

export default function DsrView({
  dsrDepostis,
  dsrOverview,
  dsrWithdraws,
  activeTab,
  setActiveTab
}: DsrViewProps) {
  const { t } = useTranslation();

  const isLoading = activeTab === 'depositDai' ? (dsrDepostis.stage === 'depositInProgress') : (dsrWithdraws.stage === 'withdrawInProgress')
  const stage = activeTab === 'depositDai' ? dsrDepostis.stage : dsrWithdraws.stage

  const currentApy = useMemo(() => {
    return formatPercent(dsrOverview.value?.apy || new BigNumber(0), { precision: 2 })
  }, [dsrOverview])
 

  return (
    <>
      <VaultHeadline
        header={t('dsr.titles.heading')}
        token={['DAI']}
        details={[
          {
            label: t('dsr.details.current-yield'),
            value: currentApy
          },
          // TODO: Implement this once we have the value locked data.
          // {
          //   label: 'Total Value Locked:',
          //   value: '350 DAI'
          // }
        ]}
      />
        <TabBar
          variant="underline"
          sections={[
            {
              value: 'overview',
              label: t('dsr.details.overview'),
              content: (
                <Grid variant="vaultContainer">
                  <Box>
                    <DsrDetailsSection 
                      totalDepositedDai={dsrWithdraws.daiDeposit}
                      currentApy={currentApy}
                    />
                  </Box>
                  <Box>
                    <DsrSideBar
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                      daiBalance={dsrDepostis.daiBalance}
                      onDepositAmountChange={handleAmountChange(dsrDepostis.change!)}
                      onWithdrawAmountChange={handleAmountChange(dsrWithdraws.change!)}
                      depositInputValue={dsrDepostis.amount}
                      withDrawInputValue={dsrWithdraws.amount}
                      daiBalanceInDsr={dsrWithdraws.daiDeposit}
                      onPrimaryButtonClick={selectPrimaryAction(stage, activeTab, dsrDepostis, dsrWithdraws)}
                      stage={stage}
                      isLoading={isLoading}
                    />
                  </Box>
                </Grid>
              ),
            },
            {
              value: 'position-info',
              label: t('system.faq'),
              content: (
                <Card variant="faq">
                  {/* TODO: Chris to add the DSR Faq */}
                  <AaveFaq />
                </Card>
              ),
            },
          ]}
        />
    </>
  )
}