module.exports = [
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'apt', type: 'address' },
      { internalType: 'address', name: 'urn', type: 'address' },
      { internalType: 'uint256', name: 'wad', type: 'uint256' },
    ],
    name: 'daiJoin_join',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'daiJoin', type: 'address' },
      { internalType: 'address', name: 'pot', type: 'address' },
      { internalType: 'uint256', name: 'wad', type: 'uint256' },
    ],
    name: 'exit',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'daiJoin', type: 'address' },
      { internalType: 'address', name: 'pot', type: 'address' },
    ],
    name: 'exitAll',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'daiJoin', type: 'address' },
      { internalType: 'address', name: 'pot', type: 'address' },
      { internalType: 'uint256', name: 'wad', type: 'uint256' },
    ],
    name: 'join',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
]
