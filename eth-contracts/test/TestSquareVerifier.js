let verifier = artifacts.require('./Verifier');
let zKProof = require('../../zokrates/code/square/proof');

contract('Testverifier', accounts => {
    const account1 = accounts[0];

    beforeEach(async function () {
        this.contract = await verifier.new({ from: account1 });
    });

    describe('test verification with correct proof', function () {
        it('verification with correct proof', async function () {
            let verified = await this.contract.verifyTx.call(
                zKProof.proof,
                zKProof.inputs,
                { from: account1 }
            );
            assert.equal(verified, true, "Verification has failed with correct proof!");
        })
    });

    describe('test verification with correct proof', function () {
        it('verification with incorrect proof', async function () {
            zKProof.inputs = [6, 30];
            let verified = await this.contract.verifyTx.call(
                zKProof.proof,
                zKProof.inputs,
                { from: account1 }
            );
            assert.equal(verified, false, "Verification has succeeded with incorrect proof!");
        })
    })
});