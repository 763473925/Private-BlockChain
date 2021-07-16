const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(data) {
        this.hash = "";
        this.height = 0;
        this.body = data;
        this.time = 0;
        this.previousBlockHash = ""
    }
}

class Blockchain {
    constructor() {
        this.chain = [];
        this.addBlock(new Block("Genesis block"));
    }

    // Add new block 添加新区块
    addBlock(newBlock) {
        // Block height 块高
        newBlock.height = this.chain.length;
        // UTC timestamp 时间戳
        newBlock.time = new Date().getTime().toString().slice(0, -3);
        // Previous block hash 前一个区块的哈希值
        if (this.chain.length > 0) {
            newBlock.previousBlockHash = this.chain[this.chain.length - 1].hash;
        }
        // Block hash 区块的哈希
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        console.log(newBlock);
        // Adding block object to chain 区块上链
        this.chain.push(newBlock);
    }

    // Get block height 获取块高
    getBlockHeight() {
        return this.chain.length - 1;
    }

    // get block 获取块
    getBlock(blockHeight) {
        // return object as a single string 将对象作为单个字符串返回
        return JSON.parse(JSON.stringify(this.chain[blockHeight]));
    }

    // validate block 验证块
    validateBlock(blockHeight) {
        // get block object 获取块目标
        let block = this.getBlock(blockHeight);
        // get block hash 获取块哈希
        let blockHash = block.hash;
        // remove block hash to test block integrity 删除块哈希以测试块完整性
        block.hash = '';
        // generate block hash 生成块哈希
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare 比较
        if (blockHash === validBlockHash) {
            return true;
        } else {
            console.log('Block # ' + blockHeight + ' invalid hash:\n' + blockHash + ' <> ' + validBlockHash);
            return false;
        }
    }

    // Validate blockchain 验证链
    validateChain() {
        let errorLog = [];
        for (var i = 0; i < this.chain.length - 1; i++) {
            // Validate block 验证块
            if (!this.validateBlock(i)) {
                errorLog.push(i);
            }
            // Compare blocks hash 比较块哈希
            let blockHash = this.chain[i].hash;
            let previousHash = this.chain[i + 1].previousBlockHash;
            if (blockHash !== previousHash) {
                errorLog.push(i);
            }
        }
        if (errorLog.length > 0) {
            console.log('Block errors = ' + errorLog.length);
            console.log('Blocks: ' + errorLog);
        } else {
            console.log('No errors detected');
        }
    }
}

// For testing
var myBlockChain = new Blockchain();

(function testAddBlock() {
    console.log("\nTesting addBlock...");
    for (var i = 0; i <= 10; i++) {
        myBlockChain.addBlock(new Block("test data " + i));
    }
})();

(function testValidateChain() {
    console.log("\nTesting validateChain...");
    myBlockChain.validateChain();
})();

(function testValidateChainError() {
    console.log("\nTesting validateChainError...");
    let errorBlocks = [2, 4, 7];
    for (var i = 0; i < errorBlocks.length; i++) {
        myBlockChain.chain[errorBlocks[i]].data = 'make chain error';
    }

    myBlockChain.validateChain();
})();