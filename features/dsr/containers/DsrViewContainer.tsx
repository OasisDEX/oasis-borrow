import { useAppContext } from "components/AppContextProvider";
import { ProductCardsLoader } from "components/productCards/ProductCardsWrapper";
import { WithLoadingIndicator } from "helpers/AppSpinner";
import { useObservable } from "helpers/observableHook";
import { useState } from "react";
import { Container } from "theme-ui";
import { DsrSidebarTabOptions } from "../sidebar/DsrSideBar";
import DsrView from "./DsrView";
import React from 'react';

export default function DsrViewContainer() {
  const { dsrDeposit$, dsr$, dsrWithdraw$ } = useAppContext()
  const dsr = useObservable(dsrDeposit$)
  const dsrOverview = useObservable(dsr$)
  const dsrWithdrawls = useObservable(dsrWithdraw$)

  const [activeTab, setActiveTab] = useState('depositDai' as DsrSidebarTabOptions)

  const [depositState] = dsr
  const [pots] = dsrOverview
  const [withdrawState] = dsrWithdrawls

  return (
    <Container
      variant="vaultPageContainer"
    >
      <WithLoadingIndicator
        value={[depositState, pots, withdrawState]}
        customLoader={<ProductCardsLoader />}
      >
        {([_depositState, _pots, _withdrawState]) => (
          <DsrView
            dsrOverview={_pots.pots.dsr}
            dsrWithdraws={_withdrawState}
            dsrDepostis={_depositState}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </WithLoadingIndicator>
    </Container>
  )
}