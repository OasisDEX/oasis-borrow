export type Subgraphs = {
  Ajna: {
    getEarnData: { dpmProxyAddress: string }
  }
  TempGraph: {
    tempMethod: undefined
  }
}

export type SubgraphsRecord = { [key in keyof Subgraphs]: string }
export type SubgraphMethodsRecord = { [key in keyof Subgraphs['Ajna' & 'Temp']]: string }
