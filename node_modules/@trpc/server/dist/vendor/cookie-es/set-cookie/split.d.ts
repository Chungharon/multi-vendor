/**
 * Based on https://github.com/unjs/cookie-es/tree/v1.2.2
 * MIT License
 *
 * Cookie-es copyright (c) Pooya Parsa <pooya@pi0.io>
 * Set-Cookie parsing based on https://github.com/nfriedly/set-cookie-parser
 * Copyright (c) 2015 Nathan Friedly <nathan@nfriedly.com> (http://nfriedly.com/)
 *
 * @see https://github.com/unjs/cookie-es/blob/main/src/set-cookie/split.ts
 */
/**
 * Set-Cookie header field-values are sometimes comma joined in one string. This splits them without choking on commas
 * that are within a single set-cookie field-value, such as in the Expires portion.
 *
 * See https://tools.ietf.org/html/rfc2616#section-4.2
 */
export declare function splitSetCookieString(cookiesString: string | string[]): string[];
//# sourceMappingURL=split.d.ts.map