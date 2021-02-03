import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata';
import { useAppContext } from 'components/AppContextProvider';
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format';
import { useObservable } from 'helpers/observableHook';
import React, { ReactNode } from 'react';
import { Box, Button,Container, SxStyleProp } from 'theme-ui';

export function Table({ header, children, sx }: React.PropsWithChildren<{header: ReactNode, sx?: SxStyleProp}>) {
    return (
        <Container 
            sx={{
                p: 0,
                borderCollapse: 'separate',
                borderSpacing: '0 9px',
                ...sx 
            }} 
            as="table"
        >
            <Box as="thead">
                <Box as="tr">
                    {header}
                </Box>
            </Box>
            <Box as="tbody">{children}</Box>
        </Container>)
}

Table.Row = function({ children, sx }: React.PropsWithChildren<{sx?: SxStyleProp}>) {
    return (
        <Box 
            sx={{
                boxShadow: 'table',
                background: 'white',
                borderRadius: '8px',
                ...sx 
            }} 
            as="tr"
        >
                {children}
        </Box>
    )
}

Table.Cell = function({ children, sx }: React.PropsWithChildren<{sx?: SxStyleProp}>) {
    return (
        <Box 
            sx={{
                p: 3,
                ':first-child': {
                    borderRadius: '8px 0 0 8px'
                },
                ':last-child': {
                    borderRadius: '0 8px 8px 0'
                },
                ...sx 
            }} 
            as="td"
        >
            {children}
        </Box>
    )
}

Table.Header = function({ children, sx }: React.PropsWithChildren<{sx?: SxStyleProp}>) {
    return (
        <Box 
            sx={{ 
                px: 3,
                color: 'text.muted',
                fontSize: 2,
                textAlign: 'left',
                ...sx,
            }} 
            as="th"
        >
            {children}
        </Box>)
}

export function TokenSymbol({ token }: {token: string}) {
    const tokenInfo = getToken(token);
    
    return <Box><Icon name={tokenInfo.icon} size="20px" sx={{ verticalAlign: 'sub', mr: 2 }}/>{token}</Box>
}

export function LandingView() {
  const { landing$ } = useAppContext()
  const landing = useObservable(landing$)

  if (landing === undefined) {
    return null
  }

    return (
        <Container>
            <Table header={
                <>
                    <Table.Header sx={{ textAlign: 'left' }}>Asset</Table.Header >
                    <Table.Header sx={{ textAlign: 'left' }}>Type</Table.Header >
                    <Table.Header sx={{ textAlign: 'right' }}>DAI Available</Table.Header >
                    <Table.Header sx={{ textAlign: 'right' }}>Stability Fee</Table.Header >
                    <Table.Header sx={{ textAlign: 'right' }}>Min. Coll Ratio</Table.Header >
                    <Table.Header></Table.Header >
                </>
            }>
                {
                    landing.rows.map(ilk => (
                        <Table.Row sx={{ td: { py: 2 } }}>
                            <Table.Cell><TokenSymbol token={ilk.token}/></Table.Cell>
                            <Table.Cell>{ilk.ilk}</Table.Cell>
                            <Table.Cell sx={{ textAlign: 'right' }}>{formatCryptoBalance(ilk.daiAvailable)}</Table.Cell>
                            <Table.Cell sx={{ textAlign: 'right' }}>{formatPercent(ilk.stabilityFee)}</Table.Cell>
                            <Table.Cell sx={{ textAlign: 'right' }}>{formatPercent(ilk.liquidationRatio)}</Table.Cell>
                            <Table.Cell sx={{ textAlign: 'right' }}>
                                <Button sx={{lineHeight: 1}} variant="outline">Open Vault</Button>
                            </Table.Cell>
                        </Table.Row>
                    ))
                }
            </Table>
        </Container>)
}
