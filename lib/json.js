"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
function isType(type) {
    return function (value) {
        return Object.prototype.toString.call(value) === "[object " + type + "]";
    };
}
var isNull = function (value) { return value === null; };
var isBoolean = isType('Boolean');
var isString = isType('String');
var isNumber = isType('Number');
var isObject = isType('Object');
var isArray = isType('Array');
function forEach(obj, fn) {
    if (isArray(obj)) {
        obj.forEach(fn);
    }
    else {
        Object.keys(obj).forEach(function (key) { return fn(obj[key], key, obj); });
    }
}
function inRange(arr, idx) {
    return idx < arr.length;
}
function keyExists(map, key) {
    return Object.prototype.hasOwnProperty.call(map, key);
}
function writeNull(target, propertyKey, descriptor) {
    var write = descriptor.value;
    descriptor.value = function (data, schema) {
        if (isNull(data)) {
            if (schema.isOptional) {
                return this.write(data);
            }
            throw Error('type error');
        }
        return write.call(this, data, schema);
    };
    return descriptor;
}
function readNull(target, propertyKey, descriptor) {
    var read = descriptor.value;
    descriptor.value = function (buffer, schema) {
        try {
            if (schema.isOptional) {
                return this.read(buffer);
            }
        }
        catch (error) {
            // do nothing
        }
        return read.call(this, buffer, schema);
    };
    return descriptor;
}
var T_NULL = 0;
var T_BOOLEAN = 1;
var T_STRING = 2;
var T_INT = 3;
var T_UNSIGNED_INT = 4;
var T_LONG = 5;
var T_UNSIGNED_LONG = 6;
var T_FLOAT = 7;
var T_DOUBLE = 8;
var T_MAP = 9;
var T_VEC = 10;
var T_TUPLE = 11;
var Encode = /** @class */ (function () {
    function Encode(schema, size) {
        if (size === void 0) { size = 1024 * 1024; }
        this.schema_ = schema;
        this.buffer_ = Buffer.alloc(size);
        this.offset_ = 0;
    }
    Encode.prototype.writeDouble_ = function (data, schema) {
        assert_1.default(isNumber(data), 'type error');
        this.offset_ = this.buffer_.writeUInt8(T_DOUBLE, this.offset_);
        this.offset_ = this.buffer_.writeDoubleBE(data, this.offset_);
    };
    Encode.prototype.writeFloat_ = function (data, schema) {
        assert_1.default(isNumber(data), 'type error');
        this.offset_ = this.buffer_.writeUInt8(T_FLOAT, this.offset_);
        this.offset_ = this.buffer_.writeFloatBE(data, this.offset_);
    };
    Encode.prototype.writeUnsignedLong_ = function (data, schema) {
        assert_1.default(isNumber(data), 'type error');
        this.offset_ = this.buffer_.writeUInt8(T_UNSIGNED_LONG, this.offset_);
        this.offset_ = this.buffer_.writeUIntBE(data, this.offset_, 8);
    };
    Encode.prototype.writeLong_ = function (data, schema) {
        assert_1.default(isNumber(data), 'type error');
        this.offset_ = this.buffer_.writeUInt8(T_LONG, this.offset_);
        this.offset_ = this.buffer_.writeIntBE(data, this.offset_, 8);
    };
    Encode.prototype.writeUnsignedInt_ = function (data, schema) {
        assert_1.default(isNumber(data), 'type error');
        this.offset_ = this.buffer_.writeUInt8(T_UNSIGNED_INT, this.offset_);
        this.offset_ = this.buffer_.writeUInt32BE(data, this.offset_);
    };
    Encode.prototype.writeInt_ = function (data, schema) {
        assert_1.default(isNumber(data), 'type error');
        this.offset_ = this.buffer_.writeUInt8(T_INT, this.offset_);
        this.offset_ = this.buffer_.writeInt32BE(data, this.offset_);
    };
    Encode.prototype.writeString_ = function (data, schema) {
        assert_1.default(isString(data), 'type error');
        this.offset_ = this.buffer_.writeUInt8(T_STRING, this.offset_);
        this.offset_ += this.buffer_.write(data + '\0', this.offset_);
    };
    Encode.prototype.writeBoolean_ = function (data, schema) {
        assert_1.default(isBoolean(data), 'type error');
        this.offset_ = this.buffer_.writeUInt8(T_BOOLEAN, this.offset_);
        this.offset_ = this.buffer_.writeUInt8(Number(data), this.offset_);
    };
    Encode.prototype.writeNull_ = function (data) {
        assert_1.default(isNull(data), 'type error');
        this.offset_ = this.buffer_.writeUInt8(T_NULL, this.offset_);
    };
    Encode.prototype.writeArray_ = function (data, schema) {
        var _this = this;
        assert_1.default(isArray(data), 'type error');
        this.writeUnsignedInt_(data.length, schema);
        forEach(data, function (value, idx) {
            _this.writeValue_(value, schema.detail);
        });
    };
    Encode.prototype.writeTuple_ = function (data, schema) {
        var _this = this;
        assert_1.default(isArray(data), 'type error');
        forEach(schema.detail, function (schema, idx) {
            assert_1.default(inRange(data, idx), 'idx error');
            _this.writeValue_(data[idx], schema);
        });
    };
    Encode.prototype.writeObject_ = function (data, schema) {
        var _this = this;
        assert_1.default(isObject(data), 'type error');
        forEach(schema.detail, function (schema, key) {
            assert_1.default(keyExists(data, key), 'key error');
            _this.writeValue_(data[key], schema);
        });
    };
    Encode.prototype.writeValue_ = function (data, schema) {
        if (schema.isBoolean) {
            this.writeBoolean_(data, schema);
        }
        else if (schema.isString) {
            this.writeString_(data, schema);
        }
        else if (schema.isInt) {
            this.writeInt_(data, schema);
        }
        else if (schema.isUnsignedInt) {
            this.writeUnsignedInt_(data, schema);
        }
        else if (schema.isLong) {
            this.writeLong_(data, schema);
        }
        else if (schema.isUnsignedLong) {
            this.writeUnsignedLong_(data, schema);
        }
        else if (schema.isFloat) {
            this.writeFloat_(data, schema);
        }
        else if (schema.isDouble) {
            this.writeDouble_(data, schema);
        }
        else if (schema.isMap) {
            this.writeObject_(data, schema);
        }
        else if (schema.isVec) {
            this.writeArray_(data, schema);
        }
        else if (schema.isTuple) {
            this.writeTuple_(data, schema);
        }
        else {
            throw Error('type error');
        }
    };
    Encode.prototype.write = function (data, schema) {
        if (!schema) {
            this.writeNull_(data);
        }
        else if (schema.isMap) {
            this.writeObject_(data, schema);
        }
        else if (schema.isVec) {
            this.writeArray_(data, schema);
        }
        else if (schema.isTuple) {
            this.writeTuple_(data, schema);
        }
        else {
            throw Error('type error');
        }
    };
    Encode.prototype.encode = function (data) {
        // reset offset
        this.offset_ = 0;
        this.write(data, this.schema_);
        return Buffer.from(this.buffer_.slice(0, this.offset_));
    };
    __decorate([
        writeNull
    ], Encode.prototype, "writeDouble_", null);
    __decorate([
        writeNull
    ], Encode.prototype, "writeFloat_", null);
    __decorate([
        writeNull
    ], Encode.prototype, "writeUnsignedLong_", null);
    __decorate([
        writeNull
    ], Encode.prototype, "writeLong_", null);
    __decorate([
        writeNull
    ], Encode.prototype, "writeUnsignedInt_", null);
    __decorate([
        writeNull
    ], Encode.prototype, "writeInt_", null);
    __decorate([
        writeNull
    ], Encode.prototype, "writeString_", null);
    __decorate([
        writeNull
    ], Encode.prototype, "writeBoolean_", null);
    __decorate([
        writeNull
    ], Encode.prototype, "writeArray_", null);
    __decorate([
        writeNull
    ], Encode.prototype, "writeTuple_", null);
    __decorate([
        writeNull
    ], Encode.prototype, "writeObject_", null);
    return Encode;
}());
var Decode = /** @class */ (function () {
    function Decode(schema) {
        this.schema_ = schema;
        this.offset_ = 0;
    }
    Decode.prototype.readDouble_ = function (buffer, schema) {
        var type = buffer.readUInt8(this.offset_);
        assert_1.default(type === T_DOUBLE, 'type error');
        this.offset_ += 1;
        var data = buffer.readDoubleBE(this.offset_);
        this.offset_ += 8;
        return data;
    };
    Decode.prototype.readFloat_ = function (buffer, schema) {
        var type = buffer.readUInt8(this.offset_);
        assert_1.default(type === T_FLOAT, 'type error');
        this.offset_ += 1;
        var data = buffer.readFloatBE(this.offset_);
        this.offset_ += 4;
        return data;
    };
    Decode.prototype.readUnsignedLong_ = function (buffer, schema) {
        var type = buffer.readUInt8(this.offset_);
        assert_1.default(type === T_UNSIGNED_LONG, 'type error');
        this.offset_ += 1;
        var data = buffer.readUIntBE(this.offset_, 8);
        this.offset_ += 8;
        return data;
    };
    Decode.prototype.readLong_ = function (buffer, schema) {
        var type = buffer.readUInt8(this.offset_);
        assert_1.default(type === T_LONG, 'type error');
        this.offset_ += 1;
        var data = buffer.readIntBE(this.offset_, 8);
        this.offset_ += 8;
        return data;
    };
    Decode.prototype.readUnsignedInt_ = function (buffer, schema) {
        var type = buffer.readUInt8(this.offset_);
        assert_1.default(type === T_UNSIGNED_INT, 'type error');
        this.offset_ += 1;
        var data = buffer.readUInt32BE(this.offset_);
        this.offset_ += 4;
        return data;
    };
    Decode.prototype.readInt_ = function (buffer, schema) {
        var type = buffer.readUInt8(this.offset_);
        assert_1.default(type === T_INT, 'type error');
        this.offset_ += 1;
        var data = buffer.readInt32BE(this.offset_);
        this.offset_ += 4;
        return data;
    };
    Decode.prototype.readString_ = function (buffer, schema) {
        var type = buffer.readUInt8(this.offset_);
        assert_1.default(type === T_STRING, 'type error');
        this.offset_ += 1;
        var end = this.offset_;
        while (end < buffer.length && buffer[end] !== 0) {
            end++;
        }
        assert_1.default(end < buffer.length, 'type error');
        var data = buffer.toString('utf-8', this.offset_, end);
        this.offset_ = end + 1;
        return data;
    };
    Decode.prototype.readBoolean_ = function (buffer, schema) {
        var type = buffer.readUInt8(this.offset_);
        assert_1.default(type === T_BOOLEAN, 'type error');
        this.offset_ += 1;
        var data = !!buffer.readUInt8(this.offset_);
        this.offset_ += 1;
        return data;
    };
    Decode.prototype.readNull_ = function (buffer) {
        var type = buffer.readUInt8(this.offset_);
        assert_1.default(type === T_NULL, 'type error');
        this.offset_ += 1;
        return null;
    };
    Decode.prototype.readArray_ = function (buffer, schema) {
        var data = [];
        var length = this.readUnsignedInt_(buffer, schema);
        for (var idx = 0; idx < length; idx++) {
            data[idx] = this.readValue_(buffer, schema.detail);
        }
        return data;
    };
    Decode.prototype.readTuple_ = function (buffer, schema) {
        var _this = this;
        var data = [];
        forEach(schema.detail, function (schema, idx) {
            data[idx] = _this.readValue_(buffer, schema);
        });
        return data;
    };
    Decode.prototype.readObject_ = function (buffer, schema) {
        var _this = this;
        var data = {};
        forEach(schema.detail, function (schema, key) {
            data[key] = _this.readValue_(buffer, schema);
        });
        return data;
    };
    Decode.prototype.readValue_ = function (buffer, schema) {
        if (schema.isBoolean) {
            return this.readBoolean_(buffer, schema);
        }
        else if (schema.isString) {
            return this.readString_(buffer, schema);
        }
        else if (schema.isInt) {
            return this.readInt_(buffer, schema);
        }
        else if (schema.isUnsignedInt) {
            return this.readUnsignedInt_(buffer, schema);
        }
        else if (schema.isLong) {
            return this.readLong_(buffer, schema);
        }
        else if (schema.isUnsignedLong) {
            return this.readUnsignedLong_(buffer, schema);
        }
        else if (schema.isFloat) {
            return this.readFloat_(buffer, schema);
        }
        else if (schema.isDouble) {
            return this.readDouble_(buffer, schema);
        }
        else if (schema.isMap) {
            return this.readObject_(buffer, schema);
        }
        else if (schema.isVec) {
            return this.readArray_(buffer, schema);
        }
        else if (schema.isTuple) {
            return this.readTuple_(buffer, schema);
        }
        else {
            throw Error('type error');
        }
    };
    Decode.prototype.read = function (buffer, schema) {
        if (!schema) {
            return this.readNull_(buffer);
        }
        else if (schema.isMap) {
            return this.readObject_(buffer, schema);
        }
        else if (schema.isVec) {
            return this.readArray_(buffer, schema);
        }
        else if (schema.isTuple) {
            return this.readTuple_(buffer, schema);
        }
        else {
            throw Error('type error');
        }
    };
    Decode.prototype.decode = function (buffer) {
        this.offset_ = 0;
        return this.read(buffer, this.schema_);
    };
    __decorate([
        readNull
    ], Decode.prototype, "readDouble_", null);
    __decorate([
        readNull
    ], Decode.prototype, "readFloat_", null);
    __decorate([
        readNull
    ], Decode.prototype, "readUnsignedLong_", null);
    __decorate([
        readNull
    ], Decode.prototype, "readLong_", null);
    __decorate([
        readNull
    ], Decode.prototype, "readUnsignedInt_", null);
    __decorate([
        readNull
    ], Decode.prototype, "readInt_", null);
    __decorate([
        readNull
    ], Decode.prototype, "readString_", null);
    __decorate([
        readNull
    ], Decode.prototype, "readBoolean_", null);
    __decorate([
        readNull
    ], Decode.prototype, "readArray_", null);
    __decorate([
        readNull
    ], Decode.prototype, "readTuple_", null);
    __decorate([
        readNull
    ], Decode.prototype, "readObject_", null);
    return Decode;
}());
function encode(schema, data, size) {
    return new Encode(schema, size).encode(data);
}
exports.encode = encode;
function decode(schema, buffer) {
    return new Decode(schema).decode(buffer);
}
exports.decode = decode;
//# sourceMappingURL=json.js.map