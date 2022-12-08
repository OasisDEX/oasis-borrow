import { WithWalletConnection } from "components/connectWallet/ConnectWallet";
import DsrViewContainer from "features/dsr/containers/DsrViewContainer";
import { Survey } from "features/survey";
import { WithTermsOfService } from "features/termsOfService/TermsOfService";
import { BackgroundLight } from "theme/BackgroundLight";


function Dsr() {
  return (
    <WithWalletConnection>
      <WithTermsOfService>
        <BackgroundLight />

        <DsrViewContainer />

        <Survey for="earn" />
      </WithTermsOfService>
    </WithWalletConnection>
  )
}

export default Dsr;