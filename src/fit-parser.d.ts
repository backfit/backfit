/// <reference types="node" />
import { FitParserOptions, FitParserResult } from './types';
export default class FitParser {
    options: FitParserOptions;
    constructor(options?: FitParserOptions);
    parse(content: Buffer): Promise<FitParserResult>;
}
