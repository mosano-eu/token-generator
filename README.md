# token-generator

[![Test Status](http://strider.findhit.com/findhit/token-generator/badge)](http://strider.findhit.com/findhit/token-generator) [![Dependency Status](https://david-dm.org/findhit/token-generator.svg)](https://david-dm.org/findhit/token-generator)

an offline token generator and validator

## What is it and what does it do?

It works on top of one dynamic variable, an **expired timestamp**. We simply create
two strings from it: an **hash part** and an **obfuscated timestamp**, then they are
concatenated into a single string and voilá, we have a token!

Each time you call `.generate` it will generate a different token because
**expiring timestamp** is always changing. Until your server reaches token's
**expiring timestamp** they will always be valid, even on different processes,
or different nodes, as since you share between them the exact same configuration.

Seems complex?
( If not, you really should dig on this and help us to make it even better )

## Why should i use it?

- It's **Open-Source** and free to use;
- You could contribute to it;
- It's extendable, because it's built on top of [findhit-class](https://github.com/findhit/class);
- You don't have to maintain a data source such as a **database table** to store
  tokens, each token carries its own check;
- It's secure, and you could increase security by providing your own hash method;
- We are also using it, if we trust on it, you should do it also!

## Installation

```bash

    npm i --save token-generator

```

## Usage

Token Generator is designed to have a simple impementation.
You just need to create an instace of TokenGenerator with your own options just like the example above:

```js

var TokenGenerator = require( 'token-generator' )({
        salt: 'your secret ingredient for this magic recipe',
        timestampMap: 'abcdefghij', // 10 chars array for obfuscation proposes
    });

```

Then you could generate and validate tokens simply as:

```js

var token = TokenGenerator.generate();

```

And check with:

```js

if ( TokenGenerator.isValid( token ) ) {
    // ...
} else {
    // ...
}

// You could also use
// .isInvalid
// .isntValid
// .isntInvalid

```

If you catch an invalid token, you could check why it is invalid by checking
manually with `.validate`

```js

try{
    TokenGenerator.validate( token )
} catch ( error ) {

    // For security proposes, error will always be 'Invalid or expired token'
    console.error( error )

    // But you can dig it up by checking `.parent` Error
    console.error( error.parent );

}

```

## Have you liked this?

Please, star this repo and if you find any issue don't hesitate to fill it or
to provide a Pull Request. :+1:
