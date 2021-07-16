const SHA256 = require('crypto-js/sha256');
const LevelDB = require('./LevelDB.js');
const Block = require('./Block.js');
const CryptoJS = require('crypto-js');

class Blockchain {

    constructor() {
        this.bd = new LevelDB.LevelDB();
        this.generateGenesisBlock();
        this.difficulty = 3;
    }

    // Create a genesis block 创建创世区块
    generateGenesisBlock() {
        let self = this;
        this.getBlockHeight()
            .then((height) => {
                if (height === 0) {
                    console.log("generateGenesisBlock | Create genesis block");
                    let block = new Block.Block("Genesis block")
                    block.height = height;
                    block.time = new Date().getTime().toString().slice(0, -3);
                    block.hash = SHA256(JSON.stringify(block)).toString();
                    self.bd.addLevelDBDataWithKey(0, JSON.stringify(block));
                }
            })
    }

    // Get block heights 获取块高
    getBlockHeight() {
        // Add your code here
        let self = this;
        return new Promise(function(resolve, reject) {
            self.bd.getBlocksCount()
                .then(value => {
                    console.log("blockCount =" + value);
                    resolve(value);
                })
                .catch(err => {
                    console.log("Not found");
                    reject(err);
                })
        })
    }

    // Add new block 添加新区块
    addBlock(block) {
        // Add your code here
        let self = this;
        return new Promise(function(resolve, reject) {
            self.getBlockHeight()
                .then(height => {
                    block.height = height;
                    block.time = new Date().getTime().toString().slice(0, -3);
                    if (height > 0) {
                        self.getBlock(height - 1)
                            .then(preBlock => {
                                block.previousBlockHash = preBlock.hash;
                                let nonce = 0;
                                let nextHash = '';
                                while (!self.isValidHashDifficulty(nextHash)) {
                                    nonce = nonce + 1;
                                    nextHash = self.calculateHash(block.height, block.previousBlockHash, block.time, block.body, nonce);
                                }
                                block.hash = nextHash;
                                block.nonce = nonce;
                                console.log("block.hash is : ", block.hash);
                                self.bd.addLevelDBData(height, JSON.stringify(block));
                                resolve(true);
                            })
                            .catch(error => {
                                console.log(error);
                                reject(error);
                            });
                    } else {
                        console.log("block SHA256 is :", SHA256(JSON.stringify(block)).toString());
                        // block.nonce = 0;
                        block.hash = self.calculateHashForBlock(block);
                        console.log("block.hash is :", block.hash);
                        self.bd.addLevelDBData(height, JSON.stringify(block));
                        resolve(true);
                    }
                })
                .catch(error => {
                    console.log(error)
                    reject(error);
                });
        });
    }

    // 拼接一串字符，返回其哈希
    calculateHash(index, previousHash, timestamp, data, nonce) {
        return CryptoJS.SHA256(index + previousHash + timestamp + data + nonce).toString()
    }

    //判断是否是有效的哈希困难值
    isValidHashDifficulty(hash) {
        for (var i = 0, b = hash.length; i < b; i++) {
            if (hash[i] !== '0') {
                break;
            }
        }
        return i === this.difficulty;
    }

 
    // Get block by height 通过索引获取块
    getBlock(height) {
        return this.bd.getLevelDBData(height)
            .then((block) => {
                console.log("getBlock | Successful, info:", block);
                return JSON.parse(block);
            }).catch((err) => {
                console.log("getBlock | Err:", err);
                return err;
            })
    }

    // Validate if block is being tampered by block height  根据区块的索引确认区块是否有效
    validateBlock(height) {
        return this.getBlock(height)
            .then(block => {
                let blockHash = block.hash;
                block.hash = "";
                let validBlockHash = this.calculateHashForBlock(block);
                block.hash = blockHash;     
                if (validBlockHash === blockHash) {
                    return { isValidBlock: true, block: block };
                } else {
                    console.log('validateBlock | Failed, block# ' + height + ' invalid hash: ' + blockHash);
                    return { isValidBlock: false, block: block };
                }
            });
    }

       //返回区块的哈希
       calculateHashForBlock(block) {
        return this.calculateHash(block.height, block.previousBlockHash, block.time, block.body, block.nonce)
    }


    // Validate blockchain 验证区块链
    validateChain() {
        let self = this;
        return this.getBlockHeight()
            .then((height) => {
                let errorLog = [];
                for (let j = 1; j < height; j++) {
                    // Validate block 验证区块
                    let i = j;
                    self.validateBlock(i)
                        .then(({ isValidBlock, block }) => {
                            if (!isValidBlock) {
                                errorLog.push(i);
                            }
                            let blockHash = block.hash;
                            // Compare blocks hash link 比较块哈希
                            if (i + 1 < height) {
                                self.getBlock(i + 1)
                                    .then((followingBlock) => {
                                        let previousHash = followingBlock.previousBlockHash;
                                        if (blockHash !== previousHash) {
                                            errorLog.push(i);
                                        }
                                    });
                            }
                        })
                }

                setTimeout(function() {
                    if (errorLog.length > 0) {
                        console.log("validateChain | The chain is not valid:");
                        errorLog.forEach(error => {
                            console.log(error);
                        });
                    } else {
                        console.log("validateChain | No errors found, The chain is Valid!");
                    }
                }, 3000);
            });
    }
}

/**
 * Test codes below
 */
function testGenerateGenesisBlock() {
    blockchain.getBlock(0)
        .then(block => {
            console.log("testGenerateGenesisBlock | Successful, genesis block:", block);
        });
}

function testGetBlockHeight() {
    blockchain.getBlockHeight()
        .then((height) => {
            console.log("testGetBlockHeight | Successful, blockchain height:", height);
            return height;
        });
}

function testGetBlock(height) {
    blockchain.getBlock(height)
        .then(block => {
            console.log("testGetBlock | Successful, block:", block);
        });
}

function testAddBlock() {
    blockchain.addBlock(new Block.Block("test1"))
        .then(height => {
            console.log("testAddBlock | Successful, block height:", height);
        });
}

function testValidateBlock(height) {
    blockchain.validateBlock(height)
        .then(({ isValidBlock, block }) => {
            console.log("testValidateBlock | Block# " + height + " is " + (isValidBlock ? 'valid' : 'invalid'));
        });
}

function testValidateChain() {
    blockchain.validateChain();
}

// Create Tests Blocks, generate new block per 10 seconds 创建测试区块，每1秒生成一个新区块
function theLoop(i) {
    setTimeout(function() {
        let blockTest = new Block.Block("Test Block - " + (i + 1));
        blockchain.addBlock(blockTest)
            .then((height) => {
                console.log('theLoop | block height:', height);
                i++;
                if (i < 10) theLoop(i);
            });
    }, 1 * 1000);
}


// Tampering a Block for the purpose of testing the validation methods 为了测试验证方法而篡改块
function tamperBlock(height) {
    blockchain.getBlock(height)
        .then((block) => {
            let tamperdBlock = block;
            tamperdBlock.body = "Tampered Block";
            blockchain.bd.addLevelDBDataWithKey(tamperdBlock.height, JSON.stringify(tamperdBlock))
                .then((block) => {
                    console.log('tamperBlock | Tampered block', height);
                });
        });
}

/**
 * Test only one function once time
 * Comment all test statements when test the others *.js code
 */
var blockchain = new Blockchain();
setTimeout(function() {
    /**
     * theLoop for using add test data before testing
     * Genesis new block per 10 seconds
     */
    //  theLoop(0);
    //testGenerateGenesisBlock();
    //testGetBlockHeight(); //获取块高
    //testGetBlock(1); //获取块信息
    //testAddBlock(); //添加新区块

    // tamperBlock(0); //篡改区块
    // testValidateBlock(5); //验证区块
    testValidateChain(); //验证链

}, 1000);

module.exports.Blockchain = Blockchain;