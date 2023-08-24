module.exports = [
  {
    constant: false,
    inputs: [{ name: 'script', type: 'bytes' }],
    name: 'execute',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: true,
    inputs: [
      { indexed: true, name: 'sig', type: 'bytes4' },
      { indexed: true, name: 'guy', type: 'address' },
      { indexed: true, name: 'foo', type: 'bytes32' },
      { indexed: true, name: 'bar', type: 'bytes32' },
      { indexed: false, name: 'wad', type: 'uint256' },
      { indexed: false, name: 'fax', type: 'bytes' },
    ],
    name: 'LogNote',
    type: 'event',
  },
]
