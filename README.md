# 私有链

这次实验以Node.js为运行环境，以JavaScript为编程语言，实现一条私有链。通过这个私有链理解区块链的数据结构和数据库，如何使用hash将区块构造成区块链，如何将包含交易数据的区块持久化。

## 实验介绍

这个实验给出两部分代码实现。第一部分是通过内存的方式实现私有链，将区块链数据存入数组中；第二部分代码是将数据存入持久化数据库中，区块链选用的是键值数据库levelDB。需要在理解第一部分内容的基础上，完成第二部分内容。

## 能学习到什么

- 私有链是什么
- 区块、区块链，以及hash在其中的作用
- 区块链基本的方法，只有增、查，没有删、改
- 区块链持久化的方法，如何使用levelDB键值数据库
- Node.js的使用方法
- JavaScript脚本语言
- Promises异步调用的使用方法

## 环境准备

- 安装[Visual Studio Code](https://code.visualstudio.com/)或者其它IDE工具。用于查看，编辑，调试

- 安装[Node.js](https://nodejs.org/zh-cn/)和[npm](https://www.npmjs.com/)，安装Node.js时，会自动安装npm。用于运行代码

  - [Node.js v8.x 中文文档](https://www.nodeapp.cn/)
  - [Node.js 官方文档](https://nodejs.org/zh-cn/)
  - [npm 中文文档](https://www.npmjs.cn/)

- 安装依赖

  - 安装LevelDB，用于持久化数据

    ```
    打开cmd
    cd 到代码根目录
    npm install level --save
    ```

  - 安装crypto-js，用于生成SHA256 Hash值

    ```
    打开cmd
    cd 到代码根目录
    npm install crypto-js --save
    ```

## 知识准备

- 学习LevelDB
  - [github](https://github.com/Level/level)
  - [npmjs](https://www.npmjs.com/package/level)

```
var level = require('level')

// 1) Create our database, supply location and options.
//    This will create or open the underlying store.
var db = level('my-db')

// 2) Put a key & value
db.put('name', 'Level', function (err) {
  if (err) return console.log('Ooops!', err) // some kind of I/O error

  // 3) Fetch by key
  db.get('name', function (err, value) {
    if (err) return console.log('Ooops!', err) // likely the key was not found

    // Ta da!
    console.log('name=' + value)
  })
})
```

- 学习crypto-js

  - [github](https://github.com/brix/crypto-js) 
  - [npmjs](https://www.npmjs.com/package/crypto-js)

  延申阅读

  -  [gitbook](https://cryptojs.gitbook.io/docs/)
  -  [google cryptojs](https://code.google.com/archive/p/crypto-js/)

```
var SHA256 = require("crypto-js/sha256");
console.log(SHA256("Message"));
```

- 学习Promise。因为读写区块的操作是异步过程，这里选用Promise帮助做异步处理
  - [promisejs]([https://www.promisejs.org](https://www.promisejs.org/)) 
  - [MDN Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
  - [菜鸟教程](https://www.runoob.com/w3cnote/javascript-promise-object.html)

```
return new Promise(function(resolve, reject) {
    // 在这添加你的代码
    // ...
    
    if(正确获取结果) {
    	resolve(value)
    } else {
    	reject(err)
    }
});
```

- 有延迟的遍历。levelDB持久化数据的操作是异步过程，创建区块的时候需要通过设置延迟、保证时间间隔
  - [Looping with a Delay](https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/)

```
(function theLoop (i) {
    setTimeout(function () {
        // 添加你的代码
        // ...

        i++;
        if (i < 10) theLoop(i);
    }, 1000);
})(0);
```

- 理解 Hash 值用于构建链式结构的作用

  ![blockchain-linked-hash](/images/blockchain-linked-hash.png)

  除了创世区块，每一个区块都保留了上一个区块的 Hash 值

## 实验步骤

### 第一步: 理解template-1代码

template-1包含区块和区块链的定义，对区块链操作的几个方法，包括创建区块，区块上链，查看区块，获取块高，验证区块，验证链。所有的数据存储在数组中，当程序运行结束时，内存会清空，数据不会持久化。

### 第二步: 测试template-1

1. 创建10个区块

   ```
   (function testAddBlock() {
       let blockchain = new Blockchain();
       for (var i = 0; i <= 10; i++) {
           blockchain.addBlock(new Block("test data "+i));
       }
   })()
   ```

2. 验证链

   ```
   (function testValidateChain() {
       let blockchain = new Blockchain();
       blockchain.validateChain();
   })()
   ```

3. 引发错误，再次验证链

   ```
   (function testValidateChainError() {
       let blockchain = new Blockchain();
   
       let errorBlocks = [2,4,7];
       for (var i = 0; i < errorBlocks.length; i++) {
         blockchain.chain[errorBlocks[i]].data='make chain error';
       }
   
       blockchain.validateChain();
   })()
   ```

### 第三步: 完成template-2

通过leveDB持久化区块链数据。学习levelDB的使用方法，将私链数据存入levelDB，可从levelDB中查看数据，查看levelDB获取块高，验证上链的区块，验证整条链。

阅读template-2代码，完成 BlockChain.js 中空缺的方法。

### 第四步: 测试template-2

完成 BlockChain.js 中空缺的方法，并进行测试。

BlockChain.js 中提供了完整的测试方法，根据方法注释的提示，完成添加块，读取块，验证块，验证链等测试工作。

