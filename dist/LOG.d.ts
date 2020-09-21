declare const _default: (filename: string) => {
    _logger: any;
    _transports: {
        console: any;
        file: any;
    };
    none: (...args: any[]) => void;
    critical: (...args: any[]) => void;
    error: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    notice: (...args: any[]) => void;
    info: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    verbose: (...args: any[]) => void;
    silly: (...args: any[]) => void;
};
export default _default;
