import { useTranslation, Trans } from "i18n";
import { Container } from "next/app";
import { Heading, Text, Box, Link } from "theme-ui";
import { Table, ColumnDef } from 'components/Table'
import { BorrowEvent_ } from "./historyEvents";
import { useAppContext } from "components/AppContextProvider";
import { useObservable } from "helpers/observableHook";
import { useMemo } from "react";
import { formatCryptoBalance, formatDateTime } from "helpers/formatters/format";
import BigNumber from "bignumber.js";

interface ColumnData extends BorrowEvent_ {
    etherscan: {
        url: string;
        apiUrl: string;
        apiKey: string;
    } | undefined
}

const columns: ColumnDef<ColumnData, {}>[] = [
    {
        headerLabel: 'event.activity',
        header: ({ label }) => <Text>{label}</Text>,
        cell: (event) => {
            const { t } = useTranslation()
            return (
                <Trans
                    i18nKey={`history.${event.kind.toLowerCase()}`}
                    // values={{
                    //     collateralAmount: event.collateralAmount ? formatCryptoBalance(new BigNumber(event.collateralAmount)) : 0,
                    //     daiAmount: event.daiAmount ? formatCryptoBalance(new BigNumber(event.daiAmount)) : 0,
                    //     cdpId: event.cdpId,
                    //     token: "ETH"
                    // }}
                    components={{ bold: <strong /> }}
                />

            )
        }
    },
    {
        headerLabel: 'event.time',
        header: ({ label }) => <Text sx={{ display: 'flex', justifyContent: 'flex-end' }}>{label}</Text>,
        cell: ({ timestamp }) => <Text sx={{ display: 'flex', justifyContent: 'flex-end' }}>{new Date(timestamp).toUTCString()}</Text>
    },
    {
        headerLabel: '',
        header: () => null,
        cell: ({ hash, etherscan }) => {
            const { t } = useTranslation()

            return (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Link
                        variant="secondary"
                        href={`${etherscan?.url}/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t('view-on-etherscan')} -{'>'}
                    </Link>
                </Box>
            )
        }
    }
]
export function HistoryTable({ id }: { id: string }) {
    const { vaultHistory$, context$ } = useAppContext()
    const { t } = useTranslation()

    const history = useObservable(vaultHistory$(id))
    const context = useObservable(context$)
    const historyWithEtherscan = useMemo(() => history && history.map(el => ({ ...el, etherscan: context?.etherscan })), [history, context?.etherscan])

    if (historyWithEtherscan === undefined) {
        return null
    }


    return (
        <Container>
            <Heading>{t('vault-history')}</Heading>
            <Table
                data={historyWithEtherscan}
                primaryKey="id"
                state={{}}
                columns={columns}
            />
        </Container>
    )
}