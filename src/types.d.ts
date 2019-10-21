export interface Activity {
    sessions: object[];
    events: object[];
    hrv: object[];
}
export interface ReadResult {
    messageType: string;
    nextIndex: number;
    message?: Fields;
}
export interface FitParserResult {
    activity?: Activity;
    sessions?: object[];
    laps?: object[];
    records?: object[];
    events?: object[];
    device_infos?: object[];
    developer_data_ids?: object[];
    field_descriptions?: object[];
    hrv?: object[];
    dive_gases?: object[];
    course_points?: object[];
}
export interface FitParserOptions {
    force?: boolean;
    speedUnit?: string;
    lengthUnit?: string;
    temperatureUnit?: string;
    elapsedRecordField?: boolean;
    mode?: string;
}
export interface TypeDef {
    littleEndian: boolean;
    globalMessageNumber: number;
    numberOfFields: number;
    fieldDefs: Def[];
}
export interface Def {
    type: any;
    fDefNo: number;
    size: number;
    endianAbility: boolean;
    littleEndian: boolean;
    baseTypeNo: number;
    name: string;
    dataType: string;
    isDeveloperField?: boolean;
    scale?: number;
    offset?: number;
}
export interface DeveloperFields {
    [data: number]: Fields[];
}
export interface Fields {
    elapsed_time?: number;
    timer_time?: number;
    timestamp?: number;
    developer_data_index?: number;
    field_definition_number?: number;
    [other: string]: any;
}
export interface MessageTypes {
    [key: number]: TypeDef;
}
export interface FitMessage {
    name: string;
    getAttributes: (number: any) => Message;
}
export interface Message {
    field?: string;
    type?: string;
    scale?: number;
    offset?: number;
}
