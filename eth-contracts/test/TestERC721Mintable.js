var NonFungiblePropertyERC721Token = artifacts.require('CRNFT');

contract('TestERC721Mintable', accounts => {

    const ownerAccount = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[2];

    describe('match erc721 spec', function () {
        const numberOfToken = 8;

        beforeEach(async function () {
            this.contract = await NonFungiblePropertyERC721Token.new({ from: ownerAccount });

            for (let i = 1; i <= numberOfToken; i++) {
                await this.contract.mint(ownerAccount, i, { from: ownerAccount });
            }

            await this.contract.mint(account1, 100, { from: ownerAccount });
            await this.contract.mint(account1, 101, { from: ownerAccount });
            await this.contract.mint(account2, 108, { from: ownerAccount });
        })

        it('should return total supply', async function () {
            let success = true;
            let totalSupply = 0;
            try {
                totalSupply = await this.contract.totalSupply();
            }
            catch {
                success = false
            }
            assert.equal(success, true, "Error caught while calling totalSupply()");
            if (success) {
                assert.equal(totalSupply, numberOfToken + 3, `Token totalSupply should be ${numberOfToken}.`);
            }
        })

        it('should get token balance', async function () {
            let success = true;
            try {
                ownerAccountBalance = await this.contract.balanceOf(ownerAccount);
                account1Balance = await this.contract.balanceOf(account1);
                account2Balance = await this.contract.balanceOf(account2);
            }
            catch {
                success = false
            }
            assert.equal(success, true, "Error caught while calling balanceOf()");
            if (success) {
                assert.equal(ownerAccountBalance.eq(web3.utils.toBN(8)), true, `balanceOf(${ownerAccountBalance}) should be ${numberOfToken}.`);
                assert.equal(account1Balance.eq(web3.utils.toBN(2)), true, `balanceOf(${account1Balance}) should be 2.`);
                assert.equal(account2Balance.eq(web3.utils.toBN(1)), true, `balanceOf(${account2Balance}) should be 1.`);
            }
        })

        it('should return token uri', async function () {
            let success = true;
            let token1URI, token2URI;
            try {
                token1URI = await this.contract.tokenURI(1);
                token2URI = await this.contract.tokenURI(2);
                token101URI = await this.contract.tokenURI(101);
                token108URI = await this.contract.tokenURI(108);
            }
            catch {
                success = false
            }
            assert.equal(success, true, "Error caught while calling tokenURI()");
            if (success) {
                assert.equal(token1URI, 'https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1', `Token has incorrect baseTokenURI.`);
                assert.equal(token2URI, 'https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/2', `Token has incorrect baseTokenURI.`);
                assert.equal(token101URI, 'https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/101', `Token has incorrect baseTokenURI.`);
                assert.equal(token108URI, 'https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/108', `Token has incorrect baseTokenURI.`);
            }
        })

        it('should transfer token from one owner to another', async function () {
            let success = true;
            try {
                await this.contract.transferFrom(ownerAccount, account1, 1, { from: ownerAccount });
            }
            catch (e) {
                success = false
            }
            assert.equal(success, true, "Error caught while calling transferFrom()");
            if (success) {
                var ownerOfaccount1Token = await this.contract.ownerOf(1);
                assert.equal(ownerOfaccount1Token, account1, "Token invalid owner");

                let ownerAccountBalance = await this.contract.balanceOf(ownerAccount);
                let account1Balance = await this.contract.balanceOf(account1);
                let account2Balance = await this.contract.balanceOf(account2);

                assert.equal(ownerAccountBalance, 7, "ownerAccount should now possess 7 tokens.");
                assert.equal(account1Balance, 3, "Account 1 balance should possess 3 tokens.")
                assert.equal(account2Balance, 1, "Account 2 balance should possess 2 tokens.")
            }
        })
    });

    describe('have ownership properties', function () {
        beforeEach(async function () {
            this.contract = await NonFungiblePropertyERC721Token.new({ from: ownerAccount });
        })

        it('should fail when minting when msg sender is not contract owner', async function () {
            var success = true;
            try {
                await this.contract.mint(ownerAccount, 6, { from: account1 });
            } catch {
                success = false;
            }
            assert.equal(success, false, "Caller must be contract owner");
        })

        it('should return contract owner', async function () {
            let owner = await this.contract.getOwner();
            assert.equal(owner, ownerAccount, "Contract owner should be account 1");
        })
    });
})