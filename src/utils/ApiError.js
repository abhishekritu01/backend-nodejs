class ApiError extends Error {
    constructor(
        status = 500,
        message = 'Internal Server Error',
        isOperational = true,
        error = [],
        stack = ''
    ) {
        super(message);
        this.status = status;
        this.isOperational = isOperational;
        this.data = null;
        this.message = message;
        this.succes = false;
        this.error = error;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}


export { ApiError };