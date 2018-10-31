
export interface Message {

    records?: Message[];
    laps?: Message[];
    timestamp?: number;
    elapsed_time?: number;

    [key: string]: number | string | undefined | Message[];
}

export interface MyRecord {
    messageType: string;
    nextIndex: number;
    message?: Message;
}
