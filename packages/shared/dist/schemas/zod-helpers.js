"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boundedString = boundedString;
exports.httpUrlString = httpUrlString;
exports.mediaUrlString = mediaUrlString;
exports.createTypeGuard = createTypeGuard;
const zod_1 = require("zod");
function boundedString(max) {
    return zod_1.z.string().max(max);
}
/** Link rendered as an `href` — only http(s) to keep `javascript:`/`data:` out. */
function httpUrlString(max) {
    return zod_1.z.string().max(max).refine((value) => {
        if (!value) {
            return true;
        }
        try {
            const { protocol } = new URL(value);
            return protocol === "http:" || protocol === "https:";
        }
        catch {
            return false;
        }
    }, { message: "Invalid link protocol." });
}
function mediaUrlString(max) {
    return zod_1.z.string().refine((value) => value.startsWith("data:") || value.length <= max, {
        message: "Invalid media URL length.",
    });
}
function createTypeGuard(schema) {
    return (value) => schema.safeParse(value).success;
}
