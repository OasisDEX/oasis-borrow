import { TransactionDef } from "components/blockchain/calls/callsHelpers";
import { contractDesc } from "components/blockchain/config";
import { ContextConnected } from "components/blockchain/network";
import dsProxy from 'components/blockchain/abi/ds-proxy.json';
import { DsProxy } from "types/web3-v1-contracts/ds-proxy";
import { amountToWei } from "components/blockchain/utils";
import { DssProxyActions } from "types/web3-v1-contracts/dss-proxy-actions";
import { LockAndDrawData } from "../../../features/deposit/deposit";

function getCallData(data: LockAndDrawData, context: ContextConnected) {
    const { dssProxyActions, dssCdpManager, mcdJoinDai, mcdJug, joins, contract } = context;
    const { id, tkn, lockAmount, drawAmount, ilk } = data;

    if (id && tkn === 'ETH') {
        return contract<DssProxyActions>(dssProxyActions).methods.lockETHAndDraw(
            dssCdpManager.address, mcdJug.address, joins[ilk], mcdJoinDai.address, id, amountToWei(drawAmount, 'DAI').toFixed(0)
        );
    }
    if (tkn === 'ETH') {
        return contract<DssProxyActions>(dssProxyActions).methods.openLockETHAndDraw(
            dssCdpManager.address, mcdJug.address, joins[ilk], mcdJoinDai.address, ilk, amountToWei(drawAmount, 'DAI').toString()
        );
    }
    if (!id && tkn === 'GNT') {
        return contract<DssProxyActions>(dssProxyActions).methods.openLockGNTAndDraw(
            dssCdpManager.address, mcdJug.address, joins[ilk], mcdJoinDai.address, ilk, amountToWei(lockAmount, 'GNT').toString(), amountToWei(drawAmount, 'DAI').toString()
        );
    }
    if (id) {
        return contract<DssProxyActions>(dssProxyActions).methods.lockGemAndDraw(
            dssProxyActions.address, mcdJug.address, joins[ilk], mcdJoinDai.address, id, amountToWei(lockAmount, tkn).toString(), amountToWei(drawAmount, 'DAI').toString(), true
        );
    }

    return contract<DssProxyActions>(dssProxyActions).methods.openLockGemAndDraw(
        dssProxyActions.address, mcdJug.address, joins[ilk], mcdJoinDai.address, ilk, amountToWei(lockAmount, tkn).toString(), amountToWei(drawAmount, 'DAI').toString(), true
    );
}
export const lockAndDraw: TransactionDef<LockAndDrawData> = {
    call: ({ proxyAddress }, { contract }) => {
        console.log({ proxyAddress, dsProxy });
        return (contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods as any)['execute(address,bytes)'];
    },
    prepareArgs: (data, context) => {
        const { dssProxyActions } = context;

        console.log([dssProxyActions.address, getCallData(data, context).encodeABI()], 'DATA');
        return [dssProxyActions.address, getCallData(data, context).encodeABI()];
    },
    options: ({ tkn, lockAmount }) => tkn === 'ETH' ? { value: amountToWei(lockAmount, 'ETH').toString() } : {}
};
