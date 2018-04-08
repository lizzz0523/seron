"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SchemaType;
(function (SchemaType) {
    SchemaType[SchemaType["BOOLEAN"] = 0] = "BOOLEAN";
    SchemaType[SchemaType["STRING"] = 1] = "STRING";
    SchemaType[SchemaType["INT"] = 2] = "INT";
    SchemaType[SchemaType["UNSIGNED_INT"] = 3] = "UNSIGNED_INT";
    SchemaType[SchemaType["LONG"] = 4] = "LONG";
    SchemaType[SchemaType["UNSIGNED_LONG"] = 5] = "UNSIGNED_LONG";
    SchemaType[SchemaType["FLOAT"] = 6] = "FLOAT";
    SchemaType[SchemaType["DOUBLE"] = 7] = "DOUBLE";
    SchemaType[SchemaType["MAP"] = 8] = "MAP";
    SchemaType[SchemaType["VEC"] = 9] = "VEC";
    SchemaType[SchemaType["TUPLE"] = 10] = "TUPLE";
})(SchemaType || (SchemaType = {}));
var Schema = /** @class */ (function () {
    function Schema(type, optional, detail) {
        if (optional === void 0) { optional = false; }
        this.type_ = type;
        this.detail_ = detail;
        this.optional_ = optional;
    }
    Object.defineProperty(Schema.prototype, "isBoolean", {
        get: function () {
            return this.type_ === SchemaType.BOOLEAN;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Schema.prototype, "isString", {
        get: function () {
            return this.type_ === SchemaType.STRING;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Schema.prototype, "isInt", {
        get: function () {
            return this.type_ === SchemaType.INT;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Schema.prototype, "isUnsignedInt", {
        get: function () {
            return this.type_ === SchemaType.UNSIGNED_INT;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Schema.prototype, "isLong", {
        get: function () {
            return this.type_ === SchemaType.LONG;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Schema.prototype, "isUnsignedLong", {
        get: function () {
            return this.type_ === SchemaType.UNSIGNED_LONG;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Schema.prototype, "isFloat", {
        get: function () {
            return this.type_ === SchemaType.FLOAT;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Schema.prototype, "isDouble", {
        get: function () {
            return this.type_ === SchemaType.DOUBLE;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Schema.prototype, "isMap", {
        get: function () {
            return this.type_ === SchemaType.MAP;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Schema.prototype, "isVec", {
        get: function () {
            return this.type_ === SchemaType.VEC;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Schema.prototype, "isTuple", {
        get: function () {
            return this.type_ === SchemaType.TUPLE;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Schema.prototype, "isOptional", {
        get: function () {
            return this.optional_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Schema.prototype, "detail", {
        get: function () {
            return this.detail_;
        },
        enumerable: true,
        configurable: true
    });
    return Schema;
}());
function bool(optional) {
    return new Schema(SchemaType.BOOLEAN, optional);
}
exports.bool = bool;
function str(optional) {
    return new Schema(SchemaType.STRING, optional);
}
exports.str = str;
function i32(optional) {
    return new Schema(SchemaType.INT, optional);
}
exports.i32 = i32;
function u32(optional) {
    return new Schema(SchemaType.UNSIGNED_INT, optional);
}
exports.u32 = u32;
function i64(optional) {
    return new Schema(SchemaType.LONG, optional);
}
exports.i64 = i64;
function u64(optional) {
    return new Schema(SchemaType.UNSIGNED_LONG, optional);
}
exports.u64 = u64;
function f32(optional) {
    return new Schema(SchemaType.FLOAT, optional);
}
exports.f32 = f32;
function f64(optional) {
    return new Schema(SchemaType.DOUBLE, optional);
}
exports.f64 = f64;
function vec(detail, optional) {
    return new Schema(SchemaType.VEC, optional, detail);
}
exports.vec = vec;
function map(detail, optional) {
    return new Schema(SchemaType.MAP, optional, detail);
}
exports.map = map;
function tuple(detail, optional) {
    return new Schema(SchemaType.TUPLE, optional, detail);
}
exports.tuple = tuple;
//# sourceMappingURL=schema.js.map