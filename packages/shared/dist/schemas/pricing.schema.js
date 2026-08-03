"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSitePricing = exports.sitePricingSchema = void 0;
const zod_1 = require("zod");
const zod_helpers_1 = require("./zod-helpers");
/** Wire shape of `GET /api/payments/pricing`, shared by the store and every page that shows a price. */
exports.sitePricingSchema = zod_1.z.object({
    currentPriceRub: zod_1.z.number().positive(),
    originalPriceRub: zod_1.z.number().positive().nullable(),
});
exports.isSitePricing = (0, zod_helpers_1.createTypeGuard)(exports.sitePricingSchema);
