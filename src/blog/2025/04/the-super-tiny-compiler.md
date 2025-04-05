---
title: 解读 the super tiny compiler
description: 解读 the super tiny compiler
coverImage: 
tags:
  - javascript
---
> https://github.com/jamiebuilds/the-super-tiny-compiler

把一些类似 Lisp 的函数调用编译成类似 C 的函数调用

```
                  LISP                      C

   2 + 2          (add 2 2)                 add(2, 2)
   4 - 2          (subtract 4 2)            subtract(4, 2)
   2 + (4 - 2)    (add 2 (subtract 4 2))    add(2, subtract(4, 2))
```

## 流程

大多数编译器分为三个主要阶段：解析、转换和代码生成

1. **解析**是将原始代码转换为代码的更抽象表示。
2. **转换**接受这个抽象表示并操作它以实现编译器想要的效果。
3. **代码生成**接受转换后的代码表示并将其转换为新代码。

compiler 内部过程

 *   1. input => tokenizer => tokens
 *   2. tokens => parser => ast
 *   3. ast => transformer => newAst
 *   4. newAst => generator => output

原始代码 (input)

```
(add 2 (subtract 4 2))
```

## 解析 Parsing

### tokenizer

**词法分析**：接受原始代码并通过一个称为分词器（或词法分析器）的工具将其分解为标记。标记是描述语法孤立部分的一系列小对象。它们可以是数字、标签、标点符号、运算符等。

原始代码生成 token 示例：

```json
[
  { type: 'paren',  value: '('        },
  { type: 'name',   value: 'add'      },
  { type: 'number', value: '2'        },
  { type: 'paren',  value: '('        },
  { type: 'name',   value: 'subtract' },
  { type: 'number', value: '4'        },
  { type: 'number', value: '2'        },
  { type: 'paren',  value: ')'        },
  { type: 'paren',  value: ')'        }
]
```

#### 源码解读

```js
// 我们首先接受一个代码字符串作为输入，然后我们需要设置两个东西...
function tokenizer(input) {

  // 一个 `current` 变量用于追踪我们在代码中的位置，就像光标一样
  let current = 0;

  // 一个 `tokens` 数组用于存储我们的标记
  let tokens = [];

  // 我们创建一个 `while` 循环，在这里我们可以根据需要增加 `current` 变量的值
  // 我们这样做是因为在单次循环中我们可能需要多次增加 `current`，因为我们的标记可以是任意长度
  while (current < input.length) {

    // 我们还要存储 `input` 中的 `current` 字符
    let char = input[current];

    // 首先我们要检查左括号。这个稍后会用于 `CallExpression`，但现在我们只关心这个字符
    // 我们检查是否遇到左括号：
    if (char === '(') {

      // 如果是，我们添加一个新的标记，类型为 `paren`，值为左括号
      tokens.push({
        type: 'paren',
        value: '(',
      });

      // 然后增加 `current`
      current++;

      // 继续下一次循环
      continue;
    }

    // 接下来我们检查右括号。我们做完全相同的事情：检查右括号，添加新标记，
    // 增加 `current`，然后继续
    if (char === ')') {
      tokens.push({
        type: 'paren',
        value: ')',
      });
      current++;
      continue;
    }

    // 继续，我们现在要检查空白字符。这很有趣，因为我们关心空白字符的存在
    // 来分隔字符，但实际上并不需要将其存储为标记。我们稍后会将其丢弃
    // 所以这里我们只是测试它的存在，如果存在就继续
    let WHITESPACE = /\s/;
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }

    // 下一个标记类型是数字。这与我们之前看到的都不同，因为数字可以是任意数量的字符
    // 我们想要将整个字符序列作为一个标记捕获
    //
    //   (add 123 456)
    //        ^^^ ^^^
    //        只有两个独立的标记
    //
    // 所以当我们遇到序列中的第一个数字时开始这个过程
    let NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {

      // 我们要创建一个 `value` 字符串来存储字符
      let value = '';

      // 然后我们遍历序列中的每个字符，直到遇到非数字字符，
      // 将每个数字字符添加到我们的 `value` 中，并相应地增加 `current`
      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }

      // 之后我们将 `number` 标记添加到 `tokens` 数组中
      tokens.push({ type: 'number', value });

      // 继续
      continue;
    }

    // 我们还要为我们的语言添加字符串支持，字符串是任何被双引号(")包围的文本
    //
    //   (concat "foo" "bar")
    //            ^^^   ^^^ 字符串标记
    //
    // 我们首先检查开始引号：
    if (char === '"') {
      // 保持一个 `value` 变量来构建我们的字符串标记
      let value = '';

      // 我们在标记中跳过开始的双引号
      char = input[++current];

      // 然后我们遍历每个字符，直到遇到另一个双引号
      while (char !== '"') {
        value += char;
        char = input[++current];
      }

      // 跳过结束的双引号
      char = input[++current];

      // 将我们的 `string` 标记添加到 `tokens` 数组中
      tokens.push({ type: 'string', value });

      continue;
    }

    // 最后一种标记类型是 `name` 标记。这是一个字母序列而不是数字，
    // 这些字母是我们 lisp 语法中函数的名称
    //
    //   (add 2 4)
    //    ^^^
    //    名称标记
    //
    let LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {
      let value = '';

      // 同样，我们只是遍历所有字母并将它们添加到 value 中
      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }

      // 将该值作为类型为 `name` 的标记添加并继续
      tokens.push({ type: 'name', value });

      continue;
    }

    // 最后，如果我们到现在还没有匹配到任何字符，我们将抛出错误并完全退出
    throw new TypeError('I dont know what this character is: ' + char);
  }

  // 最后在我们的 `tokenizer` 中，我们简单地返回 tokens 数组
  return tokens;
}
```

### parser

**语法分析**：接受标记并将它们重新格式化为一种表示，描述语法的每个部分及其相互关系。这被称为中间表示或抽象语法树。 抽象语法树（简称 AST）是一个深度嵌套的对象，它以一种既易于使用又能告诉我们大量信息的方式表示代码。

token 生成 ast 示例：

```json
{
  type: 'Program',
  body: [{
    type: 'CallExpression',
    name: 'add',
    params: [{
      type: 'NumberLiteral',
      value: '2'
    }, {
      type: 'CallExpression',
      name: 'subtract',
      params: [{
        type: 'NumberLiteral',
        value: '4'
      }, {
        type: 'NumberLiteral',
        value: '2'
      }]
    }]
  }]
}
```

#### 源码解读

```js
// 好的,我们定义一个`parser`函数来接收`tokens`数组
function parser(tokens) {

  // 同样我们保持一个`current`变量作为光标来追踪位置
  let current = 0;

  // 但这次我们要使用递归而不是while循环。所以我们定义一个`walk`函数
  function walk() {

    // 在walk函数内部,我们首先获取当前的token
    let token = tokens[current];

    // 我们要根据不同的token类型走不同的代码路径
    // 首先从`number`类型的token开始
    //
    // 我们检查是否有一个`number`类型的token
    if (token.type === 'number') {

      // 如果有,我们就增加`current`
      current++;

      // 然后返回一个新的AST节点,类型为`NumberLiteral`
      // 并将其值设置为token的值
      return {
        type: 'NumberLiteral',
        value: token.value,
      };
    }

    // 如果是字符串类型,我们做和数字类型相同的处理
    // 创建一个`StringLiteral`节点
    if (token.type === 'string') {
      current++;

      return {
        type: 'StringLiteral',
        value: token.value,
      };
    }

    // 接下来我们要寻找CallExpressions。当我们遇到左括号时开始
    if (
      token.type === 'paren' &&
      token.value === '('
    ) {

      // 我们增加`current`来跳过括号,因为在AST中我们不需要它
      token = tokens[++current];

      // 我们创建一个基础节点,类型为`CallExpression`
      // 并将name设置为当前token的值,因为在左括号后的下一个token就是函数名
      let node = {
        type: 'CallExpression',
        name: token.value,
        params: [],
      };

      // 我们再次增加`current`来跳过函数名token
      token = tokens[++current];

      // 现在我们要遍历所有将成为`CallExpression`参数的token
      // 直到遇到右括号
      //
      // 这里就是递归发挥作用的地方。我们使用递归来处理可能无限嵌套的节点
      // 而不是试图一次性解析所有内容
      //
      // 让我解释一下,以我们的Lisp代码为例。你可以看到`add`的参数
      // 是一个数字和一个嵌套的`CallExpression`,它包含自己的数字
      //
      //   (add 2 (subtract 4 2))
      //
      // 你还会注意到在我们的tokens数组中有多个右括号
      //
      //   [
      //     { type: 'paren',  value: '('        },
      //     { type: 'name',   value: 'add'      },
      //     { type: 'number', value: '2'        },
      //     { type: 'paren',  value: '('        },
      //     { type: 'name',   value: 'subtract' },
      //     { type: 'number', value: '4'        },
      //     { type: 'number', value: '2'        },
      //     { type: 'paren',  value: ')'        }, <<< 右括号
      //     { type: 'paren',  value: ')'        }, <<< 右括号
      //   ]
      //
      // 我们将依赖嵌套的`walk`函数来增加我们的`current`变量
      // 以跳过任何嵌套的`CallExpression`

      // 所以我们创建一个`while`循环,它会一直继续直到遇到
      // 类型为`'paren'`且值为右括号的token
      while (
        (token.type !== 'paren') ||
        (token.type === 'paren' && token.value !== ')')
      ) {
        // 我们调用`walk`函数,它会返回一个节点
        // 然后我们将其推入`node.params`数组
        node.params.push(walk());
        token = tokens[current];
      }

      // 最后我们再次增加`current`来跳过右括号
      current++;

      // 然后返回这个节点
      return node;
    }

    // 如果到现在我们还没有识别出token类型
    // 我们就抛出一个错误
    throw new TypeError(token.type);
  }

  // 现在,我们要创建我们的AST,它将有一个根节点
  // 类型为`Program`
  let ast = {
    type: 'Program',
    body: [],
  };

  // 我们要启动我们的`walk`函数,将节点推入`ast.body`数组
  //
  // 我们在循环中这样做的原因是我们的程序可以有多个
  // 并排的`CallExpression`而不是嵌套的
  //
  //   (add 2 2)
  //   (subtract 4 2)
  //
  while (current < tokens.length) {
    ast.body.push(walk());
  }

  // 在parser的最后我们返回AST
  return ast;
}
```

## 转换 Transformation

在转换 AST 时,我们可以通过添加/删除/替换属性来操作节点,可以添加新节点、删除节点,或者保持现有的 AST 不变并基于它创建一个全新的 AST。

深度优先遍历

```json
{
  type: 'Program',
  body: [{
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'add'
      },
      arguments: [{
        type: 'NumberLiteral',
        value: '2'
      }, {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'subtract'
        },
        arguments: [{
          type: 'NumberLiteral',
          value: '4'
        }, {
          type: 'NumberLiteral',
          value: '2'
        }]
      }
    }
  }]
}
```

### traverser

#### 源码解读

```js
/**
 * 现在我们有了AST，我们需要能够使用访问者模式来访问不同的节点。
 * 每当遇到匹配类型的节点时，我们需要能够调用访问者上的方法。
 *
 *   traverse(ast, {
 *     Program: {
 *       enter(node, parent) {
 *         // ...
 *       },
 *       exit(node, parent) {
 *         // ...
 *       },
 *     },
 *
 *     CallExpression: {
 *       enter(node, parent) {
 *         // ...
 *       },
 *       exit(node, parent) {
 *         // ...
 *       },
 *     },
 *
 *     NumberLiteral: {
 *       enter(node, parent) {
 *         // ...
 *       },
 *       exit(node, parent) {
 *         // ...
 *       },
 *     },
 *   });
 */

// 我们定义一个遍历器函数，它接受一个AST和一个访问者。
// 在函数内部，我们将定义两个函数...
function traverser(ast, visitor) {

  // `traverseArray` 函数允许我们遍历数组并调用下一个我们将定义的函数：`traverseNode`
  function traverseArray(array, parent) {
    array.forEach(child => {
      traverseNode(child, parent);
    });
  }

  // `traverseNode` 将接受一个 `node` 和它的 `parent` 节点。
  // 这样它就可以将两者都传递给我们的访问者方法。
  function traverseNode(node, parent) {

    // 我们首先测试访问者上是否存在与节点 `type` 匹配的方法
    let methods = visitor[node.type];

    // 如果这个节点类型有 `enter` 方法，我们就用 `node` 和它的 `parent` 调用它
    if (methods && methods.enter) {
      methods.enter(node, parent);
    }

    // 接下来我们将根据当前节点类型来区分处理
    switch (node.type) {

      // 我们从顶层 `Program` 开始。因为 Program 节点有一个名为 body 的属性，
      // 这个属性包含一个节点数组，我们将调用 `traverseArray` 来遍历它们。
      //
      // (记住 `traverseArray` 会依次调用 `traverseNode`，所以我们会递归地遍历树)
      case 'Program':
        traverseArray(node.body, node);
        break;

      // 我们对 `CallExpression` 做同样的事情，遍历它们的 `params`
      case 'CallExpression':
        traverseArray(node.params, node);
        break;

      // 对于 `NumberLiteral` 和 `StringLiteral` 的情况，
      // 我们没有子节点需要访问，所以直接 break
      case 'NumberLiteral':
      case 'StringLiteral':
        break;

      // 如果我们没有识别出节点类型，就抛出一个错误
      default:
        throw new TypeError(node.type);
    }

    // 如果这个节点类型有 `exit` 方法，我们就用 `node` 和它的 `parent` 调用它
    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }

  // 最后，我们通过调用 `traverseNode` 来启动遍历器，传入我们的 ast，
  // 没有 `parent` 是因为 AST 的顶层没有父节点
  traverseNode(ast, null);
}
```

### transformer

#### 代码解读

```js
// 我们的转换器函数将接受 lisp ast
function transformer(ast) {

  // 我们将创建一个 `newAst`，它和之前的 AST 一样会有一个 program 节点
  let newAst = {
    type: 'Program',
    body: [],
  };

  // 接下来我要稍微取巧一下，使用一个小技巧。我们将在父节点上使用一个名为 `context` 的属性，
  // 用来将节点推送到其父节点的 `context` 中。通常你会有一个更好的抽象方式，
  // 但为了我们的目的，这样可以让事情保持简单。
  //
  // 请注意，context 是从旧 ast 到新 ast 的引用。
  ast._context = newAst.body;

  // 我们将通过调用 traverser 函数开始，传入我们的 ast 和一个访问者
  traverser(ast, {

    // 第一个访问者方法接受任何 `NumberLiteral`
    NumberLiteral: {
      // 我们将在进入时访问它们
      enter(node, parent) {
        // 我们将创建一个新的节点，同样命名为 `NumberLiteral`，并将其推送到父节点的 context 中
        parent._context.push({
          type: 'NumberLiteral',
          value: node.value,
        });
      },
    },

    // 接下来是 `StringLiteral`
    StringLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'StringLiteral',
          value: node.value,
        });
      },
    },

    // 接下来是 `CallExpression`
    CallExpression: {
      enter(node, parent) {

        // 我们开始创建一个新的 `CallExpression` 节点，其中包含一个嵌套的 `Identifier`
        let expression = {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: node.name,
          },
          arguments: [],
        };

        // 接下来我们将在原始的 `CallExpression` 节点上定义一个新的 context，
        // 它将引用 `expression` 的 arguments，这样我们就可以推送参数
        node._context = expression.arguments;

        // 然后我们要检查父节点是否是 `CallExpression`
        // 如果不是...
        if (parent.type !== 'CallExpression') {

          // 我们将用 `ExpressionStatement` 包装我们的 `CallExpression` 节点
          // 我们这样做是因为 JavaScript 中的顶层 `CallExpression` 实际上是语句
          expression = {
            type: 'ExpressionStatement',
            expression: expression,
          };
        }

        // 最后，我们将（可能被包装的）`CallExpression` 推送到 `parent` 的 `context` 中
        parent._context.push(expression);
      },
    }
  });

  // 在转换器函数的最后，我们将返回我们刚刚创建的新 ast
  return newAst;
}
```

## 生成 Code Generation

codeGenerator 新 ast 生成代码

```
add(2, subtract(4, 2));
```

### 源码解读

```js
function codeGenerator(node) {
  // 我们将根据节点的`type`来区分处理
  switch (node.type) {
    // 如果是`Program`节点。我们将遍历`body`中的每个节点,
    // 对它们运行代码生成器,并用换行符连接它们。
    case 'Program':
      return node.body.map(codeGenerator)
        .join('\n');

    // 对于`ExpressionStatement`,我们将对嵌套的表达式调用代码生成器,
    // 并添加一个分号...
    case 'ExpressionStatement':
      return (
        codeGenerator(node.expression) +
        ';' // << (因为我们喜欢用"正确"的方式编码)
      );

    // 对于`CallExpression`,我们将打印`callee`,添加一个左括号,
    // 遍历`arguments`数组中的每个节点并对它们运行代码生成器,
    // 用逗号连接它们,然后添加一个右括号。
    case 'CallExpression':
      return (
        codeGenerator(node.callee) +
        '(' +
        node.arguments.map(codeGenerator)
          .join(', ') +
        ')'
      );

    // 对于`Identifier`,我们只返回节点的`name`。
    case 'Identifier':
      return node.name;

    // 对于`NumberLiteral`,我们只返回节点的`value`。
    case 'NumberLiteral':
      return node.value;

    // 对于`StringLiteral`,我们将在节点的`value`周围添加引号。
    case 'StringLiteral':
      return '"' + node.value + '"';

    // 如果我们没有识别出节点类型,就抛出一个错误。
    default:
      throw new TypeError(node.type);
  }
}
```