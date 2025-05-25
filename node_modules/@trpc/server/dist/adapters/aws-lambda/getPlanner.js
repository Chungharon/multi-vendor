'use strict';

var split = require('../../vendor/cookie-es/set-cookie/split.js');

function determinePayloadFormat(event) {
    // https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html
    // According to AWS support, version is is extracted from the version property in the event.
    // If there is no version property, then the version is implied as 1.0
    const unknownEvent = event;
    if (typeof unknownEvent.version === 'undefined') {
        return '1.0';
    } else {
        return unknownEvent.version;
    }
}
function getHeadersAndCookiesFromResponse(response) {
    const headers = Object.fromEntries(response.headers.entries());
    const cookies = split.splitSetCookieString(response.headers.getSetCookie()).map((cookie)=>cookie.trim());
    delete headers['set-cookie'];
    return {
        headers,
        cookies
    };
}
const v1Processor = {
    // same as getPath above
    getTRPCPath: (event)=>{
        if (!event.pathParameters) {
            // Then this event was not triggered by a resource denoted with {proxy+}
            return event.path.split('/').pop() ?? '';
        }
        const matches = event.resource.matchAll(/\{(.*?)\}/g);
        for (const match of matches){
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const group = match[1];
            if (group.includes('+') && event.pathParameters) {
                return event.pathParameters[group.replace('+', '')] ?? '';
            }
        }
        return event.path.slice(1);
    },
    url (event) {
        const hostname = event.requestContext.domainName ?? event.headers['host'] ?? event.multiValueHeaders?.['host']?.[0] ?? 'localhost';
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(event.queryStringParameters ?? {})){
            if (value !== undefined) {
                searchParams.append(key, value);
            }
        }
        const qs = searchParams.toString();
        return {
            hostname,
            pathname: event.path,
            search: qs && `?${qs}`
        };
    },
    getHeaders: (event)=>{
        const headers = new Headers();
        for (const [key, value] of Object.entries(event.headers ?? {})){
            if (value !== undefined) {
                headers.append(key, value);
            }
        }
        for (const [k, values] of Object.entries(event.multiValueHeaders ?? {})){
            if (values) {
                values.forEach((v)=>headers.append(k, v));
            }
        }
        return headers;
    },
    getMethod: (event)=>event.httpMethod,
    toResult: async (response)=>{
        const { headers, cookies } = getHeadersAndCookiesFromResponse(response);
        const result = {
            ...cookies.length && {
                multiValueHeaders: {
                    'set-cookie': cookies
                }
            },
            statusCode: response.status,
            body: await response.text(),
            headers
        };
        return result;
    }
};
const v2Processor = {
    getTRPCPath: (event)=>{
        const matches = event.routeKey.matchAll(/\{(.*?)\}/g);
        for (const match of matches){
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const group = match[1];
            if (group.includes('+') && event.pathParameters) {
                return event.pathParameters[group.replace('+', '')] ?? '';
            }
        }
        return event.rawPath.slice(1);
    },
    url (event) {
        return {
            hostname: event.requestContext.domainName,
            pathname: event.rawPath,
            search: event.rawQueryString && `?${event.rawQueryString}`
        };
    },
    getHeaders: (event)=>{
        const headers = new Headers();
        for (const [key, value] of Object.entries(event.headers ?? {})){
            if (value !== undefined) {
                headers.append(key, value);
            }
        }
        if (event.cookies) {
            headers.append('cookie', event.cookies.join('; '));
        }
        return headers;
    },
    getMethod: (event)=>event.requestContext.http.method,
    toResult: async (response)=>{
        const { headers, cookies } = getHeadersAndCookiesFromResponse(response);
        const result = {
            cookies,
            statusCode: response.status,
            body: await response.text(),
            headers
        };
        return result;
    }
};
function getPlanner(event) {
    const version = determinePayloadFormat(event);
    let processor;
    switch(version){
        case '1.0':
            processor = v1Processor;
            break;
        case '2.0':
            processor = v2Processor;
            break;
        default:
            throw new Error(`Unsupported version: ${version}`);
    }
    const urlParts = processor.url(event);
    const url = `https://${urlParts.hostname}${urlParts.pathname}${urlParts.search}`;
    const init = {
        headers: processor.getHeaders(event),
        method: processor.getMethod(event),
        // @ts-expect-error this is fine
        duplex: 'half'
    };
    if (event.body) {
        init.body = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
    }
    const request = new Request(url, init);
    return {
        path: processor.getTRPCPath(event),
        request,
        toResult: processor.toResult
    };
}

exports.getPlanner = getPlanner;
