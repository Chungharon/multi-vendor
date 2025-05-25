/**
 * Get the result of a value or function that returns a value
 * It also optionally accepts typesafe arguments for the function
 */ const resultOf = (value, ...args)=>{
    return typeof value === 'function' ? value(...args) : value;
};

export { resultOf };
