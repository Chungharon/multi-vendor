'use strict';

var observable = require('@trpc/server/observable');
var createChain = require('./internals/createChain.js');

function asArray(value) {
    return Array.isArray(value) ? value : [
        value
    ];
}
function splitLink(opts) {
    return (runtime)=>{
        const yes = asArray(opts.true).map((link)=>link(runtime));
        const no = asArray(opts.false).map((link)=>link(runtime));
        return (props)=>{
            return observable.observable((observer)=>{
                const links = opts.condition(props.op) ? yes : no;
                return createChain.createChain({
                    op: props.op,
                    links
                }).subscribe(observer);
            });
        };
    };
}

exports.splitLink = splitLink;
