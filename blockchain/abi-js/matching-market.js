module.exports = [
  {
    constant: true,
    inputs: [],
    name: 'matchingEnabled',
    outputs: [
      {
        name: '',
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
        name: 'sell_gem',
        type: 'address',
      },
      {
        name: 'buy_gem',
        type: 'address',
      },
    ],
    name: 'getBestOffer',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'pay_gem',
        type: 'address',
      },
      {
        name: 'pay_amt',
        type: 'uint256',
      },
      {
        name: 'buy_gem',
        type: 'address',
      },
      {
        name: 'min_fill_amount',
        type: 'uint256',
      },
    ],
    name: 'sellAllAmount',
    outputs: [
      {
        name: 'fill_amt',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [],
    name: 'stop',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'pay_gem',
        type: 'address',
      },
      {
        name: 'buy_gem',
        type: 'address',
      },
      {
        name: 'pay_amt',
        type: 'uint128',
      },
      {
        name: 'buy_amt',
        type: 'uint128',
      },
    ],
    name: 'make',
    outputs: [
      {
        name: '',
        type: 'bytes32',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'owner_',
        type: 'address',
      },
    ],
    name: 'setOwner',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'buy_gem',
        type: 'address',
      },
      {
        name: 'pay_gem',
        type: 'address',
      },
      {
        name: 'pay_amt',
        type: 'uint256',
      },
    ],
    name: 'getBuyAmount',
    outputs: [
      {
        name: 'fill_amt',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'pay_amt',
        type: 'uint256',
      },
      {
        name: 'pay_gem',
        type: 'address',
      },
      {
        name: 'buy_amt',
        type: 'uint256',
      },
      {
        name: 'buy_gem',
        type: 'address',
      },
      {
        name: 'pos',
        type: 'uint256',
      },
    ],
    name: 'offer',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'id',
        type: 'uint256',
      },
      {
        name: 'pos',
        type: 'uint256',
      },
    ],
    name: 'insert',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'last_offer_id',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'matchingEnabled_',
        type: 'bool',
      },
    ],
    name: 'setMatchingEnabled',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'cancel',
    outputs: [
      {
        name: 'success',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'getOffer',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
      {
        name: '',
        type: 'address',
      },
      {
        name: '',
        type: 'uint256',
      },
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'del_rank',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'id',
        type: 'bytes32',
      },
      {
        name: 'maxTakeAmount',
        type: 'uint128',
      },
    ],
    name: 'take',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'pay_gem',
        type: 'address',
      },
    ],
    name: 'getMinSell',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getTime',
    outputs: [
      {
        name: '',
        type: 'uint64',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'dustId',
    outputs: [
      {
        name: '',
        type: 'uint256',
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
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'getNextUnsortedOffer',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'close_time',
    outputs: [
      {
        name: '',
        type: 'uint64',
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
        name: '',
        type: 'address',
      },
      {
        name: '',
        type: 'address',
      },
    ],
    name: '_span',
    outputs: [
      {
        name: '',
        type: 'uint256',
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
        name: '',
        type: 'address',
      },
      {
        name: '',
        type: 'address',
      },
    ],
    name: '_best',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'stopped',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'id_',
        type: 'bytes32',
      },
    ],
    name: 'bump',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'authority_',
        type: 'address',
      },
    ],
    name: 'setAuthority',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'sell_gem',
        type: 'address',
      },
      {
        name: 'buy_gem',
        type: 'address',
      },
    ],
    name: 'getOfferCount',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'buy_gem',
        type: 'address',
      },
      {
        name: 'buy_amt',
        type: 'uint256',
      },
      {
        name: 'pay_gem',
        type: 'address',
      },
      {
        name: 'max_fill_amount',
        type: 'uint256',
      },
    ],
    name: 'buyAllAmount',
    outputs: [
      {
        name: 'fill_amt',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'isActive',
    outputs: [
      {
        name: 'active',
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
        name: '',
        type: 'uint256',
      },
    ],
    name: 'offers',
    outputs: [
      {
        name: 'pay_amt',
        type: 'uint256',
      },
      {
        name: 'pay_gem',
        type: 'address',
      },
      {
        name: 'buy_amt',
        type: 'uint256',
      },
      {
        name: 'buy_gem',
        type: 'address',
      },
      {
        name: 'owner',
        type: 'address',
      },
      {
        name: 'timestamp',
        type: 'uint64',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getFirstUnsortedOffer',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'owner',
    outputs: [
      {
        name: '',
        type: 'address',
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
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'getBetterOffer',
    outputs: [
      {
        name: '',
        type: 'uint256',
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
        name: '',
        type: 'address',
      },
    ],
    name: '_dust',
    outputs: [
      {
        name: '',
        type: 'uint256',
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
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'getWorseOffer',
    outputs: [
      {
        name: '',
        type: 'uint256',
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
        name: '',
        type: 'uint256',
      },
    ],
    name: '_near',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'kill',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'pay_gem',
        type: 'address',
      },
      {
        name: 'dust',
        type: 'uint256',
      },
    ],
    name: 'setMinSell',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'authority',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'isClosed',
    outputs: [
      {
        name: 'closed',
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
        name: '',
        type: 'uint256',
      },
    ],
    name: '_rank',
    outputs: [
      {
        name: 'next',
        type: 'uint256',
      },
      {
        name: 'prev',
        type: 'uint256',
      },
      {
        name: 'delb',
        type: 'uint256',
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
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'getOwner',
    outputs: [
      {
        name: 'owner',
        type: 'address',
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
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'isOfferSorted',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'buyEnabled_',
        type: 'bool',
      },
    ],
    name: 'setBuyEnabled',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'id',
        type: 'uint256',
      },
      {
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'buy',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'pay_amt',
        type: 'uint256',
      },
      {
        name: 'pay_gem',
        type: 'address',
      },
      {
        name: 'buy_amt',
        type: 'uint256',
      },
      {
        name: 'buy_gem',
        type: 'address',
      },
      {
        name: 'pos',
        type: 'uint256',
      },
      {
        name: 'rounding',
        type: 'bool',
      },
    ],
    name: 'offer',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'pay_amt',
        type: 'uint256',
      },
      {
        name: 'pay_gem',
        type: 'address',
      },
      {
        name: 'buy_amt',
        type: 'uint256',
      },
      {
        name: 'buy_gem',
        type: 'address',
      },
    ],
    name: 'offer',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'buyEnabled',
    outputs: [
      {
        name: '',
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
        name: 'pay_gem',
        type: 'address',
      },
      {
        name: 'buy_gem',
        type: 'address',
      },
      {
        name: 'buy_amt',
        type: 'uint256',
      },
    ],
    name: 'getPayAmount',
    outputs: [
      {
        name: 'fill_amt',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'close_time',
        type: 'uint64',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: true,
    inputs: [
      {
        indexed: true,
        name: 'sig',
        type: 'bytes4',
      },
      {
        indexed: true,
        name: 'guy',
        type: 'address',
      },
      {
        indexed: true,
        name: 'foo',
        type: 'bytes32',
      },
      {
        indexed: true,
        name: 'bar',
        type: 'bytes32',
      },
      {
        indexed: false,
        name: 'wad',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'fax',
        type: 'bytes',
      },
    ],
    name: 'LogNote',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'LogItemUpdate',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'pay_amt',
        type: 'uint256',
      },
      {
        indexed: true,
        name: 'pay_gem',
        type: 'address',
      },
      {
        indexed: false,
        name: 'buy_amt',
        type: 'uint256',
      },
      {
        indexed: true,
        name: 'buy_gem',
        type: 'address',
      },
    ],
    name: 'LogTrade',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'id',
        type: 'bytes32',
      },
      {
        indexed: true,
        name: 'pair',
        type: 'bytes32',
      },
      {
        indexed: true,
        name: 'maker',
        type: 'address',
      },
      {
        indexed: false,
        name: 'pay_gem',
        type: 'address',
      },
      {
        indexed: false,
        name: 'buy_gem',
        type: 'address',
      },
      {
        indexed: false,
        name: 'pay_amt',
        type: 'uint128',
      },
      {
        indexed: false,
        name: 'buy_amt',
        type: 'uint128',
      },
      {
        indexed: false,
        name: 'timestamp',
        type: 'uint64',
      },
    ],
    name: 'LogMake',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'id',
        type: 'bytes32',
      },
      {
        indexed: true,
        name: 'pair',
        type: 'bytes32',
      },
      {
        indexed: true,
        name: 'maker',
        type: 'address',
      },
      {
        indexed: false,
        name: 'pay_gem',
        type: 'address',
      },
      {
        indexed: false,
        name: 'buy_gem',
        type: 'address',
      },
      {
        indexed: false,
        name: 'pay_amt',
        type: 'uint128',
      },
      {
        indexed: false,
        name: 'buy_amt',
        type: 'uint128',
      },
      {
        indexed: false,
        name: 'timestamp',
        type: 'uint64',
      },
    ],
    name: 'LogBump',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'id',
        type: 'bytes32',
      },
      {
        indexed: true,
        name: 'pair',
        type: 'bytes32',
      },
      {
        indexed: true,
        name: 'maker',
        type: 'address',
      },
      {
        indexed: false,
        name: 'pay_gem',
        type: 'address',
      },
      {
        indexed: false,
        name: 'buy_gem',
        type: 'address',
      },
      {
        indexed: true,
        name: 'taker',
        type: 'address',
      },
      {
        indexed: false,
        name: 'take_amt',
        type: 'uint128',
      },
      {
        indexed: false,
        name: 'give_amt',
        type: 'uint128',
      },
      {
        indexed: false,
        name: 'timestamp',
        type: 'uint64',
      },
    ],
    name: 'LogTake',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'id',
        type: 'bytes32',
      },
      {
        indexed: true,
        name: 'pair',
        type: 'bytes32',
      },
      {
        indexed: true,
        name: 'maker',
        type: 'address',
      },
      {
        indexed: false,
        name: 'pay_gem',
        type: 'address',
      },
      {
        indexed: false,
        name: 'buy_gem',
        type: 'address',
      },
      {
        indexed: false,
        name: 'pay_amt',
        type: 'uint128',
      },
      {
        indexed: false,
        name: 'buy_amt',
        type: 'uint128',
      },
      {
        indexed: false,
        name: 'timestamp',
        type: 'uint64',
      },
    ],
    name: 'LogKill',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'authority',
        type: 'address',
      },
    ],
    name: 'LogSetAuthority',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'LogSetOwner',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'isEnabled',
        type: 'bool',
      },
    ],
    name: 'LogBuyEnabled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'pay_gem',
        type: 'address',
      },
      {
        indexed: false,
        name: 'min_amount',
        type: 'uint256',
      },
    ],
    name: 'LogMinSell',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'isEnabled',
        type: 'bool',
      },
    ],
    name: 'LogMatchingEnabled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'LogUnsortedOffer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'LogSortedOffer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'keeper',
        type: 'address',
      },
      {
        indexed: false,
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'LogInsert',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'keeper',
        type: 'address',
      },
      {
        indexed: false,
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'LogDelete',
    type: 'event',
  },
]
