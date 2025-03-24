---
title: "ES6 基础"
description: "这篇博客主要介绍了ES6的基础特性，包括let/const声明、变量解构赋值等新语法的使用方法和注意事项"
tags: ["javascript", "es6"]
---

## let const

### let暂时性死区

`暂时性死区`也意味着`typeof`不再是一个百分之百安全的操作

```js
function bar(x = y, y = 2) {
  return [x, y];
}

bar(); // 报错
//参数x默认值等于另一个参数y，而此时y还没有声明，属于”死区“。
```

```js
function bar(x = 2, y = x) {
  return [x, y];
}
bar(); // [2, 2]
```

### 块级作用域

外层代码块不受内层代码块的影响

```js
function f1() {
  let n = 5;
  if (true) {
    let n = 10;
  }
  console.log(n); // 5
}
```

立即执行函数表达式（IIFE）不再必要

```js
// IIFE 写法
(function () {
  var tmp = ...;
  ...
}());

// 块级作用域写法
{
  let tmp = ...;
  ...
}
```

> 应该避免在块级作用域内声明函数。如果确实需要，也应该写成函数表达式，而不是函数声明语句

### const 命令

- 声明一个只读的常量。一旦声明，常量的值就不能改变
- 一旦声明变量，就必须立即初始化，不能留到以后赋值
- 与`let`一样只在声明所在的块级作用域内有效
- 与`let`一样存在暂时性死区
- 与`let`一样不可重复声明

`const`只能保证这个指针是固定的，至于它指向的数据结构是不是可变的，就完全不能控制了。因此，将一个对象声明为常量必须非常小心

如果真的想将对象冻结，应该使用`Object.freeze`方法

```js
const foo = Object.freeze({});

// 常规模式时，下面一行不起作用；
// 严格模式时，该行会报错
foo.prop = 123;
```

将对象彻底冻结

```js
var constantize = (obj) => {
  Object.freeze(obj);
  Object.keys(obj).forEach( (key, i) => {
    if ( typeof obj[key] === 'object' ) {
      constantize( obj[key] );
    }
  });
};
```

## 变量的解构赋值

### 数组的解构赋值

这种写法属于“模式匹配”，只要等号两边的模式相同，左边的变量就会被赋予对应的值

如果解构不成功，变量的值就等于undefined

```js
let [foo, [[bar], baz]] = [1, [[2], 3]];
console.log(foo); // 1
console.log(bar); // 2
console.log(baz); // 3

let [ , , third] = ["foo", "bar", "baz"];
console.log(third); // "baz"

let [x, , y] = [1, 2, 3];
console.log(x); // 1
console.log(y); // 3

let [head, ...tail] = [1, 2, 3, 4];
console.log(head); // 1
console.log(tail); // [2, 3, 4]

let [x1, y1, ...z1] = ['a'];
console.log(x1); // "a"
console.log(y1); // undefined
console.log(z1); // []
```

不完全解构

```js
let [x, y] = [1, 2, 3];
console.log(x); // 1
console.log(y); // 2

let [a, [b], d] = [1, [2, 3], 4];
console.log(a); // 1
console.log(b); // 2
console.log(d); // 4
```

如果等号的右边不是数组（或者严格地说，不是可遍历的结构，参见《Iterator》一章），那么将会报错

```js
// 报错
let [foo] = 1;
let [foo] = false;
let [foo] = NaN;
let [foo] = undefined;
let [foo] = null;
let [foo] = {};
```

Set 结构

```js
let [x, y, z] = new Set(['a', 'b', 'c']);
x // "a"
```

具有 Iterator 接口

```js
function* fibs() {
  let a = 0;
  let b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

let [first, second, third, fourth, fifth, sixth] = fibs();
sixth // 5
```

> 以上例子想要在`console`中运行，需要用`{}`包起来

### 对象的解构赋值

如果变量名与属性名不一致

```js
let { foo: baz } = { foo: 'aaa', bar: 'bbb' };
baz // "aaa"

let obj = { first: 'hello', last: 'world' };
let { first: f, last: l } = obj;
f // 'hello'
l // 'world'
```

### 字符串的解构赋值

```js
const [a, b, c, d, e] = 'hello';
a // "h"
b // "e"
c // "l"
d // "l"
e // "o"

let {length : len} = 'hello';
len // 5
```

### 数值和布尔值的解构赋值

```js
let {toString: s1} = 123;
console.log(s1 === Number.prototype.toString) // true

let {toString: s2} = true;
console.log(s2 === Boolean.prototype.toString) // true
```

如果等号右边是数值和布尔值，则会先转为对象

数值和布尔值的包装对象都有toString属性，因此变量s1，s2都能取到值

### 函数参数的解构赋值

```js
function add([x, y]){
  return x + y;
}

add([1, 2]); // 3
```

> 建议只要有可能，就不要在模式中放置圆括号

### 用途

交换变量的值

```js
let x = 1;
let y = 2;

[x, y] = [y, x];
```

从函数返回多个值

```js
// 返回一个数组

function example() {
  return [1, 2, 3];
}
let [a, b, c] = example();

// 返回一个对象

function example() {
  return {
    foo: 1,
    bar: 2
  };
}
let { foo, bar } = example();
```

函数参数的定义

```js
// 参数是一组有次序的值
function f([x, y, z]) { ... }
f([1, 2, 3]);

// 参数是一组无次序的值
function f({x, y, z}) { ... }
f({z: 3, y: 2, x: 1});
```

提取 JSON 数据

```js
let jsonData = {
  id: 42,
  status: "OK",
  data: [867, 5309]
};

let { id, status, data: number } = jsonData;

console.log(id, status, number);
```

函数参数的默认值

```js
jQuery.ajax = function (url, {
  async = true,
  beforeSend = function () {},
  cache = true,
  complete = function () {},
  crossDomain = false,
  global = true,
  // ... more config
} = {}) {
  // ... do stuff
};
```

遍历 Map 结构

```js
const map = new Map();
map.set('first', 'hello');
map.set('second', 'world');

for (let [key, value] of map) {
  console.log(key + " is " + value);
}
// first is hello
// second is world
```

```js
// 获取键名
for (let [key] of map) {
  // ...
}

// 获取键值
for (let [,value] of map) {
  // ...
}
```

输入模块的指定方法

```js
const { SourceMapConsumer, SourceNode } = require("source-map");
```
