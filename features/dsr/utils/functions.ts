import { TFunction } from "next-i18next";
import { DsrDepositStage, DsrDepositState } from "../helpers/dsrDeposit";
import { DsrWithdrawStage, DsrWithdrawState } from "../helpers/dsrWithdraw";
import { DsrSidebarTabOptions } from "../sidebar/DsrSideBar";

// TODO: Move this to translations and add withdraw logic
export function createPrimaryButtonLabel(stage: DsrDepositStage | DsrWithdrawStage, activeTab: DsrSidebarTabOptions, t: TFunction) {
  if (['depositSuccess', 'withdrawSuccess'].includes(stage)) return t('Finished')
  if (stage === 'depositInProgress' && activeTab === 'depositDai') return t('Depositing DAI')
  if (stage === 'withdrawInProgress' && activeTab === 'withdrawDai') return t('Withdrawing DAI')
  if (activeTab === 'withdrawDai') return t('Withdraw')
  return t('Deposit')
}

export function selectPrimaryAction(stage: DsrWithdrawStage | DsrDepositStage, activeTab: DsrSidebarTabOptions, dsrDepositState: DsrDepositState, dsrWithdrawsState: DsrWithdrawState) {
  switch (stage) {
    case 'depositSuccess':
      return dsrDepositState.reset
    case 'withdrawSuccess':
      return dsrWithdrawsState.reset
    default:
      return activeTab === 'depositDai' ? dsrDepositState.deposit : dsrWithdrawsState.withdraw
  }
}