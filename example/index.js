const SJSON = require('../index')
const { i32, str, bool, map, tuple } = SJSON.schema

const data = {
    "object": {
        "string": "string",
        "number": 42,
        "true": true,
        "false": false,
        "null": null
    },
    "array": [
        "string",
        42,
        true,
        false,
        null
    ]
}

const schema = map({
    "object": map({
        "string": str(),
        "number": i32(),
        "true": bool(),
        "false": bool(),
        "null": i32(true)
    }),
    "array": tuple([
        str(),
        i32(),
        bool(),
        bool(),
        i32(true)
    ])
})

const encode = SJSON.encode(schema, data)
console.log(Buffer.from(JSON.stringify(data)).length)
console.log(encode.length)
console.log(encode)

const decode = SJSON.decode(schema, encode)
console.log(decode)