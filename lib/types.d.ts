export interface Activity {
    sessions?: Fields;
    events?: Fields;
    hrv?: Fields;
}
export interface ReadResult {
    messageType: string;
    nextIndex: number;
    message?: Fields;
}
export interface FitParserResult {
    activity?: Activity;
    sessions?: Fields;
    laps?: Fields;
    records?: Fields;
    events?: Fields;
    device_infos?: Fields;
    developer_data_ids?: Fields;
    field_descriptions?: Fields;
    hrv?: Fields;
    dive_gases?: Fields;
    course_points?: Fields;
    [default_message: string]: Fields | undefined;
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
    getAttributes: (key: number) => Message;
}
export interface Message {
    field?: string;
    type?: string;
    scale?: number | string | null;
    offset?: number | string;
    units?: string;
}
