import { getNetworkId } from '@oasisdex/web3-context';
import { useAppContext } from 'components/AppContextProvider';
import { getConnector } from 'components/connectWallet/ConnectWallet';
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format';
import { useObservable } from 'helpers/observableHook';
import React, { ComponentProps, ComponentType, ReactNode, useEffect } from 'react';
import { Container, Box, SxStyleProp, Button } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons'

type IconProps = Omit<ComponentProps<typeof Icon>, 'name'>
const TokenSymbolMap: Record<string, ComponentType<IconProps>> = {
    ETH: props => <Icon name="ether" {...props}/>,
    BAT: props => <Icon name="bat" {...props}/>,
    SAI: props => <Icon name="sai" {...props}/>,
    WBTC: props => <Icon name="wbtc" {...props}/>,
    TUSD: props => <Icon name="tusd" {...props}/>,
    KNC: props => <Icon name="kyber" {...props}/>,
    MANA: props => <Icon name="mana" {...props}/>,
    PAXUSD: props => <Icon name="pax" {...props}/>, 
    USDT: props => <Icon name="usdt" {...props}/>, 
    COMP: props => <Icon name="compound" {...props}/>, 
    LRC: props => <Icon name="lrc" {...props}/>, 
    LINK: props => <Icon name="chainlink" {...props}/>, 
    GUSD: props => <Icon name="gemini" {...props}/>,
    ZRX: props => <Icon name="zerox" {...props}/>,
    USDC: props => <Icon name="usdc" {...props}/>,
    
    YFI: props => <Icon name="close" color="red" {...props}/>, // MISSING ICON
    BAL: props => <Icon name="close" color="red" {...props}/>, // MISSING ICON
} // THIS MIGHT BE MOVED TO CONFIG

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

function TokenSymbol({ token }: {token: string}) {
    const TokenIcon = TokenSymbolMap[token] || TokenSymbolMap.ETH
    return <Box><TokenIcon size="20px" sx={{verticalAlign: 'sub'}} /> {token}</Box>
}

export function LandingView() {
    const { landing$, web3Context$ } = useAppContext();
    const landing = useObservable(landing$);
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
                            <Table.Cell><TokenSymbol token={ilk.token}/></Table.Cell>
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