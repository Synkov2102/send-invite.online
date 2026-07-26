"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishedInviteSiteShapeSchema = exports.publishedInviteSiteSchema = exports.createInviteSitePayloadShapeSchema = exports.createInviteSitePayloadSchema = exports.isPublishedInviteSite = exports.isInviteSitePalette = exports.isInviteState = void 0;
exports.normalizeInviteState = normalizeInviteState;
exports.parseCreateInviteSitePayload = parseCreateInviteSitePayload;
exports.validateInviteFieldLimits = validateInviteFieldLimits;
exports.validatePaletteFieldLimits = validatePaletteFieldLimits;
const zod_helpers_1 = require("./zod-helpers");
const invite_palette_schema_1 = require("./invite-palette.schema");
const invite_site_schema_1 = require("./invite-site.schema");
Object.defineProperty(exports, "createInviteSitePayloadSchema", { enumerable: true, get: function () { return invite_site_schema_1.createInviteSitePayloadSchema; } });
Object.defineProperty(exports, "createInviteSitePayloadShapeSchema", { enumerable: true, get: function () { return invite_site_schema_1.createInviteSitePayloadShapeSchema; } });
Object.defineProperty(exports, "publishedInviteSiteSchema", { enumerable: true, get: function () { return invite_site_schema_1.publishedInviteSiteSchema; } });
Object.defineProperty(exports, "publishedInviteSiteShapeSchema", { enumerable: true, get: function () { return invite_site_schema_1.publishedInviteSiteShapeSchema; } });
const invite_state_schema_1 = require("./invite-state.schema");
exports.isInviteState = (0, zod_helpers_1.createTypeGuard)(invite_state_schema_1.inviteStateShapeSchema);
exports.isInviteSitePalette = (0, zod_helpers_1.createTypeGuard)(invite_palette_schema_1.inviteSitePaletteShapeSchema);
exports.isPublishedInviteSite = (0, zod_helpers_1.createTypeGuard)(invite_site_schema_1.publishedInviteSiteShapeSchema);
/** Fill defaults for invites saved before newer optional fields existed. */
function normalizeInviteState(invite) {
    return invite_state_schema_1.inviteStateShapeSchema.parse(invite);
}
function getIssuePath(error) {
    return error.issues[0]?.path.map(String).join(".") ?? "";
}
function mapInviteLimitError(error) {
    const path = getIssuePath(error);
    if (path === "mapUrl") {
        return "Ссылка на Яндекс Карты слишком длинная или некорректная.";
    }
    if (path === "groupChatUrl") {
        return "Ссылка на общий чат слишком длинная или должна начинаться с http:// или https://.";
    }
    if (path === "groupChatText" || path === "additionalInfo") {
        return "Слишком длинный текст дополнительного блока.";
    }
    if (path.startsWith("dressCodeColors")) {
        return "Слишком длинные или некорректные цвета дресс-кода.";
    }
    if (path.startsWith("schedule")) {
        return path === "schedule"
            ? "Слишком длинное расписание."
            : "Слишком длинные или некорректные пункты расписания.";
    }
    if (path.startsWith("rsvpQuestions")) {
        return path === "rsvpQuestions"
            ? "Слишком много вопросов RSVP."
            : "Слишком длинные или некорректные вопросы RSVP.";
    }
    return "Слишком длинные или некорректные данные приглашения.";
}
function mapPaletteLimitError() {
    return "Слишком длинные или некорректные данные палитры.";
}
function parseCreateInviteSitePayload(value) {
    const shapeResult = invite_site_schema_1.createInviteSitePayloadShapeSchema.safeParse(value);
    if (!shapeResult.success) {
        const path = getIssuePath(shapeResult.error);
        if (path === "templateId") {
            return { error: "Неизвестный шаблон приглашения.", ok: false };
        }
        if (path.startsWith("invite")) {
            return { error: "Не удалось прочитать данные приглашения.", ok: false };
        }
        if (path.startsWith("palette")) {
            return { error: "Не удалось прочитать палитру приглашения.", ok: false };
        }
        return { error: "Некорректные данные сайта.", ok: false };
    }
    const inviteLimits = invite_state_schema_1.inviteStateSchema.safeParse(shapeResult.data.invite);
    if (!inviteLimits.success) {
        return { error: mapInviteLimitError(inviteLimits.error), ok: false };
    }
    const paletteLimits = invite_palette_schema_1.inviteSitePaletteSchema.safeParse(shapeResult.data.palette);
    if (!paletteLimits.success) {
        return { error: mapPaletteLimitError(), ok: false };
    }
    const strictResult = invite_site_schema_1.createInviteSitePayloadSchema.safeParse(value);
    if (!strictResult.success) {
        const path = getIssuePath(strictResult.error);
        if (path === "templateId") {
            return { error: "Неизвестный шаблон приглашения.", ok: false };
        }
        if (path.startsWith("invite")) {
            return { error: mapInviteLimitError(strictResult.error), ok: false };
        }
        if (path.startsWith("palette")) {
            return { error: mapPaletteLimitError(), ok: false };
        }
        return { error: "Некорректные данные сайта.", ok: false };
    }
    return {
        ok: true,
        payload: strictResult.data,
    };
}
function validateInviteFieldLimits(value) {
    const result = invite_state_schema_1.inviteStateSchema.safeParse(value);
    return result.success ? null : mapInviteLimitError(result.error);
}
function validatePaletteFieldLimits(value) {
    const result = invite_palette_schema_1.inviteSitePaletteSchema.safeParse(value);
    return result.success ? null : mapPaletteLimitError();
}
