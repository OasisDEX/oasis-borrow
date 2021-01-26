import { getNetworkId } from '@oasisdex/web3-context';
import { useAppContext } from 'components/AppContextProvider';
import { getConnector } from 'components/connectWallet/ConnectWallet';
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format';
import { useObservable } from 'helpers/observableHook';
import React, { ReactNode, useEffect } from 'react';
import { Container, Box, SxStyleProp, Button } from 'theme-ui';

function Table({header, children, sx}: React.PropsWithChildren<{header: ReactNode, sx?: SxStyleProp}>) {
    return (
        <Container sx={{border: '1px solid #D8DFE3', borderCollapse: 'collapse', p: 0, ...sx}} as="table">
            <Box as="thead">
                <Box as="tr">
                    {header}
                </Box>
            </Box>
            <Box as="tbody">{children}</Box>
        </Container>)
}

Table.Row = function({children, sx}: React.PropsWithChildren<{sx?: SxStyleProp}>) {
    return <Box sx={{borderBottom: '1px solid #D8DFE3', ...sx}} as="tr">{children}</Box>
}

Table.Cell = function({children, sx}: React.PropsWithChildren<{sx?: SxStyleProp}>) {
    return <Box sx={{px: 3, ...sx}} as="td">{children}</Box>
}

Table.Header = function({children, sx}: React.PropsWithChildren<{sx?: SxStyleProp}>) {
    return <Box sx={{px: 3, lineHeight: 4, borderBottom: '1px solid #D8DFE3', ...sx}} as="th">{children}</Box>
}

export function LandingView() {
    const { landing$, context$, readonlyAccount$, web3Context$ } = useAppContext();
    const landing = useObservable(landing$);
    const context = useObservable(context$);
    const account = useObservable(readonlyAccount$);
    
    console.log({landing, context, account});

    useEffect(() => {
        const subscription = web3Context$.subscribe(async web3Context => {
            if(web3Context.status === 'notConnected') {
                web3Context.connect(await getConnector('network', getNetworkId()), 'network')
            }
        })
        return () => subscription.unsubscribe()
    }, [])

    if  (landing === undefined) {
        return null;
    }


    return (
        <Container>
            <Table header={
                <>
                    <Table.Header sx={{textAlign: 'left'}}>Asset</Table.Header >
                    <Table.Header sx={{textAlign: 'left'}}>Type</Table.Header >
                    <Table.Header sx={{textAlign: 'right'}}>DAI Available</Table.Header >
                    <Table.Header sx={{textAlign: 'right'}}>Stability Fee</Table.Header >
                    <Table.Header sx={{textAlign: 'right'}}>Min. Coll Ratio</Table.Header >
                    <Table.Header></Table.Header >
                </>
            }>
                {
                    landing?.rows.map(ilk => (
                        <Table.Row sx={{td: {py: 2}}}>
                            <Table.Cell>{ilk.token}</Table.Cell>
                            <Table.Cell>{ilk.ilk}</Table.Cell>
                            <Table.Cell sx={{textAlign: 'right'}}>{formatCryptoBalance(ilk.daiAvailable)}</Table.Cell>
                            <Table.Cell sx={{textAlign: 'right'}}>{formatPercent(ilk.stabilityFee)}</Table.Cell>
                            <Table.Cell sx={{textAlign: 'right'}}>{formatPercent(ilk.liquidationRatio)}</Table.Cell>
                            <Table.Cell sx={{textAlign: 'right'}}>
                                <Button variant="outline">Open Vault</Button>
                            </Table.Cell>
                        </Table.Row>
                    ))
                }
            </Table>
        </Container>)
}