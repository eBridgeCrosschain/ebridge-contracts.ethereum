import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { EbridgeContractsTon } from '../wrappers/EbridgeContractsTon';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('EbridgeContractsTon', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('EbridgeContractsTon');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let ebridgeContractsTon: SandboxContract<EbridgeContractsTon>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        ebridgeContractsTon = blockchain.openContract(EbridgeContractsTon.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await ebridgeContractsTon.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: ebridgeContractsTon.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and ebridgeContractsTon are ready to use
    });
});
