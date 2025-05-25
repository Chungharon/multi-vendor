import { observable } from '@trpc/server/observable';
import { createChain } from './internals/createChain.mjs';

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
            return observable((observer)=>{
                const links = opts.condition(props.op) ? yes : no;
                return createChain({
                    op: props.op,
                    links
                }).subscribe(observer);
            });
        };
    };
}

export { splitLink };
