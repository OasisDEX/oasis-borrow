export interface EtherscanConfig {
  url: string
}

interface Etherscan {
  transaction: (tx: string) => Resource
}

interface Resource {
  url: string
  open: () => void
}

function openPopup(url: string) {
  if (!process.browser) {
    return
  }
  window.open(url, '_blank')
  window.focus()
}

function resource(route: (id: string) => string): (id: string) => Resource {
  return (id: string) => {
    const url = route(id)
    return { url, open: () => openPopup(url) }
  }
}

export function etherscan(config: EtherscanConfig): Etherscan {
  return {
    transaction: resource((tx: string) => `${config.url}/tx/${tx}`),
  }
}
