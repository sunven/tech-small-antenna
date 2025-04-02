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

1. *解析*是将原始代码转换为代码的更抽象表示。
2. *转换*接受这个抽象表示并操作它以实现编译器想要的效果。
3. *代码生成*接受转换后的代码表示并将其转换为新代码。

compiler 内部过程

 *   1. input => tokenizer => tokens
 *   2. tokens => parser => ast
 *   3. ast => transformer => newAst
 *   4. newAst => generator => output

原始代码:

```
(add 2 (subtract 4 2))
```

### 解析 Parsing

#### tokenizer

*词法分析*：接受原始代码并通过一个称为分词器（或词法分析器）的工具将其分解为标记。标记是描述语法孤立部分的一系列小对象。它们可以是数字、标签、标点符号、运算符等。

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

#### parser

*语法分析*：接受标记并将它们重新格式化为一种表示，描述语法的每个部分及其相互关系。这被称为中间表示或抽象语法树。 抽象语法树（简称 AST）是一个深度嵌套的对象，它以一种既易于使用又能告诉我们大量信息的方式表示代码。

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

### 转换 Transformation

transformer

ast 生成新 ast 示例：

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
      }]
    }
  }]
}
```

### 生成 Code Generation

codeGenerator

新 ast 生成代码

```
add(2, subtract(4, 2));
```

