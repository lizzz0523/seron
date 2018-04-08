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

console.time('seron')
const encode = SJSON.encode(schema, data)
console.timeEnd('seron')

console.time('json')
const json = Buffer.from(JSON.stringify(data))
console.timeEnd('json')

console.log('seron: ', encode.length)
console.log('json: ', json.length)

const decode = SJSON.decode(schema, encode)
console.log(decode)