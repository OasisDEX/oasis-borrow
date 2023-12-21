import type { PositionId } from "./position-id";
import type { NetworkNames } from "../../../blockchain/networks";
import type { VaultType } from "../../generalManageVault/vaultType.types";
import type { AaveLikeLendingProtocol } from "../../../lendingProtocols";
import type { IStrategyConfig } from "./strategy-config";
import type { ProxiesRelatedWithPosition } from "../helpers";

export type ManageViewInfo = {
  positionId: PositionId
  networkName: NetworkNames
  vaultType: VaultType
  protocol: AaveLikeLendingProtocol
  strategyConfig: IStrategyConfig
  proxiesRelatedWithPosition: ProxiesRelatedWithPosition
}
