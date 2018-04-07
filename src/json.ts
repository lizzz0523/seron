import assert from 'assert'
import { ISchema, ISchemaDetail } from './schema'

type IMap<T> = { [key: string]: T }
type IVec<T> = T[]

type IBufferWrite<T> = (data: T, schema?: ISchema) => void
type IBufferRead<T> = (buffer: Buffer, schema?: ISchema) => T

interface IEncode {
    write: IBufferWrite<any>
    encode(data: any): Buffer
}

interface IDecode {
    read: IBufferRead<any>
    decode(buffer: Buffer): any
}

function isType<T>(type: string) {
    return (value: any): value is T => {
        return Object.prototype.toString.call(value) === `[object ${ type }]`
    }
}

const isNull = value => value === null
const isBoolean = isType<boolean>('Boolean')
const isString = isType<string>('String')
const isNumber = isType<number>('Number')
const isObject = isType<IMap<any>>('Object')
const isArray = isType<IVec<any>>('Array')

type IMapIterator<T> = (val: T, key: string, obj: IMap<T>) => void
type IVecIterator<T> = (val: T, key: number, obj: IVec<T>) => void

function forEach<T>(obj: IVec<T>, fn: IVecIterator<T>): void
function forEach<T>(obj: IMap<T>, fn: IMapIterator<T>): void
function forEach<T>(obj: IMap<T> | IVec<T>, fn: IMapIterator<T> | IVecIterator<T>): void {
    if (isArray(obj)) {
        obj.forEach(fn as IVecIterator<T>)
    } else {
        Object.keys(obj).forEach(key => (fn as IMapIterator<T>)(obj[key], key, obj))
    }
}

function inRange(arr: any[], idx: number): boolean {
    return idx < arr.length
}

function keyExists(map: Object, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(map, key)
}

function writeNull(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const write: IBufferWrite<any> = descriptor.value

    descriptor.value = function (this: IEncode, data: any, schema: ISchema) {
        if (isNull(data)) {
            if (schema.isOptional) {
                return this.write(data)
            }
            
            throw Error('type error')
        }

        return write.call(this, data, schema)
    }

    return descriptor
}

function readNull(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const read: IBufferRead<any> = descriptor.value

    descriptor.value = function (this: IDecode, buffer: Buffer, schema: ISchema) {
        try {
            if (schema.isOptional) {
                return this.read(buffer)
            }
        } catch (error) {
            // do nothing
        }

        return read.call(this, buffer, schema)
    }

    return descriptor
}

const T_NULL          = 0b00000000
const T_BOOLEAN       = 0b00000001
const T_STRING        = 0b00000010
const T_INT           = 0b00000011
const T_UNSIGNED_INT  = 0b00000100
const T_LONG          = 0b00000101
const T_UNSIGNED_LONG = 0b00000110
const T_FLOAT         = 0b00000111
const T_DOUBLE        = 0b00001000
const T_MAP           = 0b00001001
const T_VEC           = 0b00001010
const T_TUPLE         = 0b00001011

class Encode implements IEncode {
    private schema_: ISchema
    private buffer_: Buffer
    private offset_: number

    constructor(schema: ISchema, size: number = 1024 * 1024) {
        this.schema_ = schema
        this.buffer_ = Buffer.alloc(size)
        this.offset_ = 0
    }

    @writeNull
    private writeDouble_(data: number, schema: ISchema): void {
        assert(isNumber(data), 'type error')

        this.offset_ = this.buffer_.writeUInt8(T_DOUBLE, this.offset_)
        this.offset_ = this.buffer_.writeDoubleBE(data, this.offset_)
    }

    @writeNull
    private writeFloat_(data: number, schema: ISchema): void {
        assert(isNumber(data), 'type error')

        this.offset_ = this.buffer_.writeUInt8(T_FLOAT, this.offset_)
        this.offset_ = this.buffer_.writeFloatBE(data, this.offset_)
    }
    
    @writeNull
    private writeUnsignedLong_(data: number, schema: ISchema): void {
        assert(isNumber(data), 'type error')

        this.offset_ = this.buffer_.writeUInt8(T_UNSIGNED_LONG, this.offset_)
        this.offset_ = this.buffer_.writeUIntBE(data, this.offset_, 8)
    }

    @writeNull
    private writeLong_(data: number, schema: ISchema): void {
        assert(isNumber(data), 'type error')

        this.offset_ = this.buffer_.writeUInt8(T_LONG, this.offset_)
        this.offset_ = this.buffer_.writeIntBE(data, this.offset_, 8)
    }

    @writeNull
    private writeUnsignedInt_(data: number, schema: ISchema): void {
        assert(isNumber(data), 'type error')

        this.offset_ = this.buffer_.writeUInt8(T_UNSIGNED_INT, this.offset_)
        this.offset_ = this.buffer_.writeUInt32BE(data, this.offset_)
    }

    @writeNull
    private writeInt_(data: number, schema: ISchema): void {
        assert(isNumber(data), 'type error')

        this.offset_ = this.buffer_.writeUInt8(T_INT, this.offset_)
        this.offset_ = this.buffer_.writeInt32BE(data, this.offset_)
    }

    @writeNull
    private writeString_(data: string, schema: ISchema): void {
        assert(isString(data), 'type error')

        this.offset_ = this.buffer_.writeUInt8(T_STRING, this.offset_)
        this.offset_ += this.buffer_.write(data + '\0', this.offset_)
    }

    @writeNull
    private writeBoolean_(data: boolean, schema: ISchema): void {
        assert(isBoolean(data), 'type error')

        this.offset_ = this.buffer_.writeUInt8(T_BOOLEAN, this.offset_)
        this.offset_ = this.buffer_.writeUInt8(Number(data), this.offset_)
    }

    private writeNull_(data: any): void {
        assert(isNull(data), 'type error')

        this.offset_ = this.buffer_.writeUInt8(T_NULL, this.offset_)
    }

    @writeNull
    private writeArray_(data: IVec<any>, schema: ISchema): void {
        assert(isArray(data), 'type error')
        
        this.writeUnsignedInt_(data.length, schema)

        forEach(data, (value, idx) => {
            this.writeValue_(value, schema.detail as ISchema)
        })
    }

    @writeNull
    private writeTuple_(data: IVec<any>, schema: ISchema): void {
        assert(isArray(data), 'type error')

        forEach(schema.detail as IVec<ISchema>, (schema, idx) => {
            assert(inRange(data, idx), 'idx error')
            this.writeValue_(data[idx], schema)
        })
    }

    @writeNull
    private writeObject_(data: IMap<any>, schema: ISchema): void {
        assert(isObject(data), 'type error')

        forEach(schema.detail as IMap<ISchema>, (schema, key) => {
            assert(keyExists(data, key), 'key error')
            this.writeValue_(data[key], schema)
        })
    }
    
    private writeValue_(data: any, schema: ISchema): void {
        if (schema.isBoolean) {
            this.writeBoolean_(data, schema)
        } else if (schema.isString) {
            this.writeString_(data, schema)
        } else if (schema.isInt) {
            this.writeInt_(data, schema)
        } else if (schema.isUnsignedInt) {
            this.writeUnsignedInt_(data, schema)
        } else if (schema.isLong) {
            this.writeLong_(data, schema)
        } else if (schema.isUnsignedLong) {
            this.writeUnsignedLong_(data, schema)
        } else if (schema.isFloat) {
            this.writeFloat_(data, schema)
        } else if (schema.isDouble) {
            this.writeDouble_(data, schema)
        } else if (schema.isMap) {
            this.writeObject_(data, schema)
        } else if (schema.isVec) {
            this.writeArray_(data, schema)
        } else if (schema.isTuple) {
            this.writeTuple_(data, schema)
        } else {
            throw Error('type error')
        }
    }

    write(data: any, schema?: ISchema): void {
        if (!schema) {
            this.writeNull_(data)
        } else if (schema.isMap) {
            this.writeObject_(data, schema)
        } else if (schema.isVec) {
            this.writeArray_(data, schema)
        } else if (schema.isTuple) {
            this.writeTuple_(data, schema)
        } else {
            throw Error('type error')
        }
    }

    encode(data: any): Buffer {
        // reset offset
        this.offset_ = 0
        this.write(data, this.schema_)
        
        return Buffer.from(this.buffer_.slice(0, this.offset_))
    }
}

class Decode implements IDecode {
    private schema_: ISchema
    private offset_: number

    constructor(schema: ISchema) {
        this.schema_ = schema
        this.offset_ = 0
    }

    @readNull
    private readDouble_(buffer: Buffer, schema: ISchema): number {
        const type = buffer.readUInt8(this.offset_)

        assert(type === T_DOUBLE, 'type error')
        this.offset_ += 1

        const data = buffer.readDoubleBE(this.offset_)
        this.offset_ += 8

        return data
    }

    @readNull
    private readFloat_(buffer: Buffer, schema: ISchema): number {
        const type = buffer.readUInt8(this.offset_)

        assert(type === T_FLOAT, 'type error')
        this.offset_ += 1

        const data = buffer.readFloatBE(this.offset_)
        this.offset_ += 4

        return data
    }

    @readNull
    private readUnsignedLong_(buffer: Buffer, schema: ISchema): number {
        const type = buffer.readUInt8(this.offset_)

        assert(type === T_UNSIGNED_LONG)
        this.offset_ += 1

        const data = buffer.readUIntBE(this.offset_, 8)
        this.offset_ += 8

        return data
    }

    @readNull
    private readLong_(buffer: Buffer, schema: ISchema): number {
        const type = buffer.readUInt8(this.offset_)

        assert(type === T_LONG, 'type error')
        this.offset_ += 1

        const data = buffer.readIntBE(this.offset_, 8)
        this.offset_ += 8

        return data
    }

    @readNull
    private readUnsignedInt_(buffer: Buffer, schema: ISchema): number {
        const type = buffer.readUInt8(this.offset_)

        assert(type === T_UNSIGNED_INT, 'type error')
        this.offset_ += 1

        const data = buffer.readUInt32BE(this.offset_)
        this.offset_ += 4

        return data
    }

    @readNull
    private readInt_(buffer: Buffer, schema: ISchema): number {
        const type = buffer.readUInt8(this.offset_)

        assert(type === T_INT)
        this.offset_ += 1

        const data = buffer.readInt32BE(this.offset_)
        this.offset_ += 4

        return data
    }

    @readNull
    private readString_(buffer: Buffer, schema: ISchema): string {
        const type = buffer.readUInt8(this.offset_)

        assert(type === T_STRING, 'type error')
        this.offset_ += 1

        let end = this.offset_

        while (end < buffer.length && buffer[end] !== 0) {
            end++
        }

        assert(end < buffer.length, 'type error')

        const data = buffer.toString('utf-8', this.offset_, end)
        this.offset_ = end + 1

        return data
    }

    @readNull
    private readBoolean_(buffer: Buffer, schema: ISchema): boolean {
        const type = buffer.readUInt8(this.offset_)

        assert(type === T_BOOLEAN)
        this.offset_ += 1

        const data = !!buffer.readUInt8(this.offset_)
        this.offset_ += 1

        return data
    }

    private readNull_(buffer: Buffer) {
        const type = buffer.readUInt8(this.offset_)

        assert(type === T_NULL, 'type error')
        this.offset_ += 1

        return null
    }

    @readNull
    private readArray_(buffer: Buffer, schema: ISchema): IVec<any> {
        const data: IVec<any> = []
        const length = this.readUnsignedInt_(buffer, schema)

        for (let idx = 0; idx < length; idx++) {
            data[idx] = this.readValue_(buffer, schema.detail as ISchema)
        }

        return data
    }

    @readNull
    private readTuple_(buffer: Buffer, schema: ISchema): IVec<any> {
        const data: IVec<any> = []

        forEach(schema.detail as IVec<ISchema>, (schema, idx) => {
            data[idx] = this.readValue_(buffer, schema)
        })

        return data
    }

    @readNull
    private readObject_(buffer: Buffer, schema: ISchema): IMap<any> {
        const data: IMap<any> = {}

        forEach(schema.detail as IMap<ISchema>, (schema, key) => {
            data[key] = this.readValue_(buffer, schema)
        })

        return data
    }

    private readValue_(buffer: Buffer, schema: ISchema): any {
        if (schema.isBoolean) {
            return this.readBoolean_(buffer, schema)
        } else if (schema.isString) {
            return this.readString_(buffer, schema)
        } else if (schema.isInt) {
            return this.readInt_(buffer, schema)
        } else if (schema.isUnsignedInt) {
            return this.readUnsignedInt_(buffer, schema)
        } else if (schema.isLong) {
            return this.readLong_(buffer, schema)
        } else if (schema.isUnsignedLong) {
            return this.readUnsignedLong_(buffer, schema)
        } else if (schema.isFloat) {
            return this.readFloat_(buffer, schema)
        } else if (schema.isDouble) {
            return this.readDouble_(buffer, schema)
        } else if (schema.isMap) {
            return this.readObject_(buffer, schema)
        } else if (schema.isVec) {
            return this.readArray_(buffer, schema)
        } else if (schema.isTuple) {
            return this.readTuple_(buffer, schema)
        } else {
            throw Error('type error')
        }
    }

    read(buffer: Buffer, schema?: ISchema): any {
        if (!schema) {
            return this.readNull_(buffer)
        } else if (schema.isMap) {
            return this.readObject_(buffer, schema)
        } else if (schema.isVec) {
            return this.readArray_(buffer, schema)
        } else if (schema.isTuple) {
            return this.readTuple_(buffer, schema)
        } else {
            throw Error('type error')
        }
    }

    decode(buffer: Buffer): any {
        this.offset_ = 0

        return this.read(buffer, this.schema_)
    }
}

export function encode(schema: ISchema, data: any, size?: number) {
    return new Encode(schema, size).encode(data)
}

export function decode(schema: ISchema, buffer: Buffer) {
    return new Decode(schema).decode(buffer)
}