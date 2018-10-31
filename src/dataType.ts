enum DataType {
    'enum',
    'sint8',
    'uint8',
    'sint16',
    'unit16',
    'sint32',
    'uint32',
    'string',
    'float32',
    'float64',
    'uint8z',
    'uint16z',
    'uint32z',
    'byte',
    'sint64',
    'uint64',
    'uint64z',
}

export function isInvalidValue(data: number, type: DataType) {
    switch (type) {
        case DataType.enum: return data === 0xFF;
        case DataType.sint8: return data === 0x7F;
        case DataType.uint8: return data === 0xFF;
        case DataType.sint16: return data === 0x7FFF;
        case DataType.unit16: return data === 0xFFFF;
        case DataType.sint32: return data === 0x7FFFFFFF;
        case DataType.uint32: return data === 0xFFFFFFFF;
        case DataType.string: return data === 0x00;
        case DataType.float32: return data === 0xFFFFFFFF;
        case DataType.float64: return data === 0xFFFFFFFFFFFFFFFF;
        case DataType.uint8z: return data === 0x00;
        case DataType.uint16z: return data === 0x0000;
        case DataType.uint32z: return data === 0x000000;
        case DataType.byte: return data === 0xFF;
        case DataType.sint64: return data === 0x7FFFFFFFFFFFFFFF;
        case DataType.uint64: return data === 0xFFFFFFFFFFFFFFFF;
        case DataType.uint64z: return data === 0x0000000000000000;
        default: return false;
    }
}

export default DataType;
