"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boundedString = boundedString;
exports.mediaUrlString = mediaUrlString;
exports.createTypeGuard = createTypeGuard;
const zod_1 = require("zod");
function boundedString(max) {
    return zod_1.z.string().max(max);
}
function mediaUrlString(max) {
    return zod_1.z.string().refine((value) => value.startsWith("data:") || value.length <= max, {
        message: "Invalid media URL length.",
    });
}
function createTypeGuard(schema) {
    return (value) => schema.safeParse(value).success;
}
