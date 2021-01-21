import { useAppContext } from 'components/AppContextProvider';
import { useObservable } from 'helpers/observableHook';
import { Container, Box, Text, Heading } from 'theme-ui';

export function Balances({ owner }: { owner: string; }) {
  const { balances$ } = useAppContext();
  const balances = useObservable(balances$(owner));
  const balancesToDisplay = balances
    ? Object.entries(balances)
      // .filter(([symbol, amount]) => amount.isGreaterThan(0) || symbol === 'ETH')
      .map(([symbol, amount]) => (
        <Box key={symbol}>
          <Text sx={{ display: 'inline', fontWeight: 'bold' }}>{symbol}:</Text>
          <Text sx={{ display: 'inline' }}>{amount.toString()}</Text>
        </Box>))
    : null;
    
    
  return (
    <Container>
      <Heading as="h2">Balances</Heading>
      {balancesToDisplay}
    </Container>);
}
