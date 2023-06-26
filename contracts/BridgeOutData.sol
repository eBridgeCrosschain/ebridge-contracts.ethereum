pragma solidity 0.8.9;
pragma experimental ABIEncoderV2;

struct Report{
    bytes _report;
    bytes32[] _rs; // observer signatures->r
    bytes32[] _ss; //observer signatures->s
    bytes32 _rawVs;
}