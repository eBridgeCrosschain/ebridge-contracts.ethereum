import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type EbridgeContractsTonConfig = {};

export function ebridgeContractsTonConfigToCell(config: EbridgeContractsTonConfig): Cell {
    return beginCell().endCell();
}

export class EbridgeContractsTon implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new EbridgeContractsTon(address);
    }

    static createFromConfig(config: EbridgeContractsTonConfig, code: Cell, workchain = 0) {
        const data = ebridgeContractsTonConfigToCell(config);
        const init = { code, data };
        return new EbridgeContractsTon(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}


