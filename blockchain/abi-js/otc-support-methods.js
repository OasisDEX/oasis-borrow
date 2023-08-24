module.exports = [
  {
    constant: true,
    inputs: [
      {
        name: 'otc',
        type: 'address',
      },
      {
        name: 'payToken',
        type: 'address',
      },
      {
        name: 'buyToken',
        type: 'address',
      },
    ],
    name: 'getOffers',
    outputs: [
      {
        name: 'ids',
        type: 'uint256[100]',
      },
      {
        name: 'payAmts',
        type: 'uint256[100]',
      },
      {
        name: 'buyAmts',
        type: 'uint256[100]',
      },
      {
        name: 'owners',
        type: 'address[100]',
      },
      {
        name: 'timestamps',
        type: 'uint256[100]',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'otc',
        type: 'address',
      },
      {
        name: 'buyToken',
        type: 'address',
      },
      {
        name: 'buyAmt',
        type: 'uint256',
      },
      {
        name: 'payToken',
        type: 'address',
      },
    ],
    name: 'getOffersAmountToBuyAll',
    outputs: [
      {
        name: 'ordersToTake',
        type: 'uint256',
      },
      {
        name: 'takesPartialOrder',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'otc',
        type: 'address',
      },
      {
        name: 'offerId',
        type: 'uint256',
      },
    ],
    name: 'getOffers',
    outputs: [
      {
        name: 'ids',
        type: 'uint256[100]',
      },
      {
        name: 'payAmts',
        type: 'uint256[100]',
      },
      {
        name: 'buyAmts',
        type: 'uint256[100]',
      },
      {
        name: 'owners',
        type: 'address[100]',
      },
      {
        name: 'timestamps',
        type: 'uint256[100]',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'otc',
        type: 'address',
      },
      {
        name: 'payToken',
        type: 'address',
      },
      {
        name: 'payAmt',
        type: 'uint256',
      },
      {
        name: 'buyToken',
        type: 'address',
      },
    ],
    name: 'getOffersAmountToSellAll',
    outputs: [
      {
        name: 'ordersToTake',
        type: 'uint256',
      },
      {
        name: 'takesPartialOrder',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]
