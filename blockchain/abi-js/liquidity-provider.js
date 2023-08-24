module.exports = [
  {
    constant: false,
    inputs: [
      {
        name: 'otc',
        type: 'address',
      },
      {
        name: 'baseToken',
        type: 'address',
      },
      {
        name: 'quoteToken',
        type: 'address',
      },
    ],
    name: 'cancelMyOffers',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'otc',
        type: 'address',
      },
      {
        name: 'baseToken',
        type: 'address',
      },
      {
        name: 'quoteToken',
        type: 'address',
      },
      {
        name: 'midPrice',
        type: 'uint256',
      },
      {
        name: 'delta',
        type: 'uint256',
      },
      {
        name: 'baseAmount',
        type: 'uint256',
      },
      {
        name: 'count',
        type: 'uint256',
      },
    ],
    name: 'linearOffers',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
]
