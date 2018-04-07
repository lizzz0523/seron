export interface ISchema {
    isBoolean: boolean
    isString: boolean
    isInt: boolean
    isUnsignedInt: boolean
    isLong: boolean
    isUnsignedLong: boolean
    isFloat: boolean
    isDouble: boolean
    isMap: boolean
    isVec: boolean
    isTuple: boolean
    isOptional: boolean
    detail?: ISchemaDetail
}

type ISchemaMap = { [key: string]: ISchema }
type ISchemaVec = ISchema[]

export type ISchemaDetail = ISchemaMap | ISchemaVec | ISchema

enum SchemaType {
    BOOLEAN,
    STRING,
    INT,
    UNSIGNED_INT,
    LONG,
    UNSIGNED_LONG,
    FLOAT,
    DOUBLE,
    MAP,
    VEC,
    TUPLE
}

class Schema implements ISchema {
    private type_: SchemaType
    private detail_?: ISchemaDetail
    private optional_: boolean

    constructor(type: SchemaType, optional: boolean = false, detail?: ISchemaDetail) {
        this.type_ = type
        this.detail_ = detail
        this.optional_ = optional
    }

    get isBoolean() {
        return this.type_ === SchemaType.BOOLEAN
    }

    get isString() {
        return this.type_ === SchemaType.STRING
    }

    get isInt() {
        return this.type_ === SchemaType.INT
    }

    get isUnsignedInt() {
        return this.type_ === SchemaType.UNSIGNED_INT
    }

    get isLong() {
        return this.type_ === SchemaType.LONG
    }

    get isUnsignedLong() {
        return this.type_ === SchemaType.UNSIGNED_LONG
    }

    get isFloat() {
        return this.type_ === SchemaType.FLOAT
    }

    get isDouble() {
        return this.type_ === SchemaType.DOUBLE
    }

    get isMap() {
        return this.type_ === SchemaType.MAP
    }

    get isVec() {
        return this.type_ === SchemaType.VEC
    }

    get isTuple() {
        return this.type_ === SchemaType.TUPLE
    }

    get isOptional() {
        return this.optional_
    }

    get detail() {
        return this.detail_
    }
}

export function bool(optional?: boolean): ISchema {
    return new Schema(SchemaType.BOOLEAN, optional)
}

export function str(optional?: boolean): ISchema {
    return new Schema(SchemaType.STRING, optional)
}

export function i32(optional?: boolean): ISchema {
    return new Schema(SchemaType.INT, optional)
}

export function u32(optional?: boolean): ISchema {
    return new Schema(SchemaType.UNSIGNED_INT, optional)
}

export function i64(optional?: boolean): ISchema {
    return new Schema(SchemaType.LONG, optional)
}

export function u64(optional?: boolean): ISchema {
    return new Schema(SchemaType.UNSIGNED_LONG, optional)
}

export function f32(optional?: boolean): ISchema {
    return new Schema(SchemaType.FLOAT, optional)
}

export function f64(optional?: boolean): ISchema {
    return new Schema(SchemaType.DOUBLE, optional)
}

export function vec(detail: ISchema, optional?: boolean): ISchema {
    return new Schema(SchemaType.VEC, optional, detail)
}

export function map(detail: ISchemaMap, optional?: boolean): ISchema {
    return new Schema(SchemaType.MAP, optional, detail)
}

export function tuple(detail: ISchemaVec, optional?: boolean): ISchema {
    return new Schema(SchemaType.TUPLE, optional, detail)
}