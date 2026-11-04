export const DEBUG = false;

export const logger = {
    debug(...args) {
        if (DEBUG)
            console.debug(...args);
    },
    warn(...args) {
        if (DEBUG)
            console.warn(...args);
    },
    error(...args) {
        if (DEBUG)
            console.error(...args);
    },
};
