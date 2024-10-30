import { toNano } from '@ton/core';
import { EbridgeContractsTon } from '../wrappers/EbridgeContractsTon';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ebridgeContractsTon = provider.open(EbridgeContractsTon.createFromConfig({}, await compile('EbridgeContractsTon')));

    await ebridgeContractsTon.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(ebridgeContractsTon.address);

    // run methods on `ebridgeContractsTon`
}
