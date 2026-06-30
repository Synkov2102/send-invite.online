import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import ExcelJS from "exceljs";
import {
  parseCreateInviteSitePayload,
  type CreateInviteSitePayload,
  type PublishedInviteSite,
} from "@invite/shared";
import { InviteSiteStore } from "./invite-site.store";
import { InviteResponseStore } from "./invite-response.store";
import { InviteTemplateStore } from "./invite-template.store";
import { parseDataMusicUrl, parseDataUrl } from "./media-utils";
import { parseRsvpResponse } from "./rsvp-response.parser";
import {
  getImageFieldForSlot,
  INVITE_IMAGE_SLOTS,
  isInviteImageSlot,
} from "./site-image-slots";
import {
  ALLOWED_AUDIO_MIME_TYPES,
  ALLOWED_IMAGE_MIME_TYPES,
  getCreateSiteErrorMessage,
  getPublicImageUrl,
  getPublicMusicUrl,
  InviteImageUploadError,
  InviteMusicUploadError,
  isS3NotConfiguredError,
  resolveStoredMedia,
  type ServedMedia,
} from "./sites-media";
import { assertAllowedStoredMediaUrl, assertMediaFileSize } from "./media-url";
import { sanitizeExcelCell } from "./excel-sanitize";
import { S3StorageService } from "../storage/s3-storage.service";

@Injectable()
export class SitesService {
  constructor(
    private readonly inviteResponses: InviteResponseStore,
    private readonly inviteSites: InviteSiteStore,
    private readonly inviteTemplates: InviteTemplateStore,
    private readonly s3Storage: S3StorageService,
  ) {}

  async createSite(body: unknown, ownerId: string) {
    const parsed = parseCreateInviteSitePayload(body);

    if (!parsed.ok) {
      throw new BadRequestException({ error: parsed.error });
    }

    try {
      await this.assertKnownTemplate(parsed.payload.templateId);
      const payload = await this.prepareSitePayload(parsed.payload);

      const site = await this.inviteSites.saveInviteSite(payload, ownerId);

      return {
        id: site.id,
        url: `/invite/sites/${site.id}`,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException({
        error: getCreateSiteErrorMessage(error),
      });
    }
  }

  async getPublishedSiteForClient(id: string) {
    const site = await this.inviteSites.getInviteSite(id);

    if (!site || !site.isPublished) {
      return null;
    }

    return this.toPublishedSiteForClient(site);
  }

  async getManagedSite(ownerId: string, siteId: string) {
    const site = await this.getOwnedSite(ownerId, siteId);
    const publicSite = this.toPublishedSiteForClient(site);

    return {
      ...publicSite,
      isPublished: site.isPublished,
    };
  }

  async updateSite(ownerId: string, siteId: string, body: unknown) {
    const existingSite = await this.getOwnedSite(ownerId, siteId);
    const parsed = parseCreateInviteSitePayload(body);

    if (!parsed.ok) {
      throw new BadRequestException({ error: parsed.error });
    }

    await this.assertKnownTemplate(parsed.payload.templateId);

    const payloadWithExistingMedia = this.restoreExistingMediaRefs(
      siteId,
      parsed.payload,
      existingSite,
    );
    const payload = await this.prepareSitePayload(payloadWithExistingMedia);
    const site = await this.inviteSites.updateInviteSite(siteId, ownerId, payload);

    if (!site) {
      throw new NotFoundException({ error: "Сайт не найден." });
    }

    return {
      id: site.id,
      url: `/invite/sites/${site.id}`,
    };
  }

  async setSitePublished(ownerId: string, siteId: string, body: unknown) {
    const isPublished = this.parsePublishedFlag(body);
    const site = await this.inviteSites.setInviteSitePublished(
      siteId,
      ownerId,
      isPublished,
    );

    if (!site) {
      throw new NotFoundException({ error: "Сайт не найден." });
    }

    return {
      id: site.id,
      isPublished: site.isPublished,
    };
  }

  async saveResponse(siteId: string, body: unknown) {
    const site = await this.inviteSites.getInviteSite(siteId);

    if (!site || !site.isPublished) {
      throw new NotFoundException({ error: "Сайт не найден." });
    }

    if (!site.invite.showRsvp) {
      throw new BadRequestException({ error: "Форма ответов отключена." });
    }

    const response = parseRsvpResponse(body, site.invite.rsvpQuestions);
    const saved = await this.inviteResponses.upsertResponse({
      ...response,
      siteId,
    });

    return {
      id: saved.id,
      updatedAt: saved.updatedAt,
    };
  }

  async getOwnedSites(ownerId: string) {
    const sites = await this.inviteSites.listInviteSitesByOwner(ownerId);
    const counts = await this.inviteResponses.countResponsesBySites(
      sites.map((site) => site.id),
    );

    return {
      sites: sites.map((site) => ({
        bride: site.invite.bride,
        createdAt: site.createdAt,
        date: site.invite.date,
        groom: site.invite.groom,
        id: site.id,
        isPublished: site.isPublished,
        rsvpEnabled: site.invite.showRsvp,
        responseCount: counts.get(site.id) ?? 0,
        templateId: site.templateId,
        url: `/invite/sites/${site.id}`,
      })),
    };
  }

  async getResponses(ownerId: string, siteId: string) {
    const site = await this.getOwnedSite(ownerId, siteId);
    const responses = await this.inviteResponses.listResponsesBySite(siteId);

    return {
      questions: site.invite.rsvpQuestions.map((question) => question.title),
      responses: responses.map((response) => ({
        answers: response.answers,
        createdAt: response.createdAt,
        guestName: response.guestName,
        id: response.id,
        updatedAt: response.updatedAt,
      })),
      site: {
        bride: site.invite.bride,
        date: site.invite.date,
        groom: site.invite.groom,
        id: site.id,
      },
    };
  }

  async exportResponses(ownerId: string, siteId: string) {
    const data = await this.getResponses(ownerId, siteId);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ответы гостей", {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    worksheet.columns = [
      { header: "Дата ответа", key: "updatedAt", width: 22 },
      { header: "Имя гостя", key: "guestName", width: 30 },
      ...data.questions.map((question, index) => ({
        header: question,
        key: `question-${index}`,
        width: 32,
      })),
    ];

    for (const response of data.responses) {
      const row: Record<string, Date | string> = {
        guestName: sanitizeExcelCell(response.guestName),
        updatedAt: new Date(response.updatedAt),
      };

      for (const answer of response.answers) {
        row[`question-${answer.questionIndex}`] = sanitizeExcelCell(answer.values.join(", "));
      }

      worksheet.addRow(row);
    }

    worksheet.autoFilter = {
      from: { column: 1, row: 1 },
      to: { column: worksheet.columnCount, row: 1 },
    };
    worksheet.getRow(1).height = 28;
    worksheet.getRow(1).eachCell((cell) => {
      cell.alignment = { vertical: "middle", wrapText: true };
      cell.fill = {
        fgColor: { argb: "FF26383A" },
        pattern: "solid",
        type: "pattern",
      };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    });
    worksheet.getColumn("updatedAt").numFmt = "yyyy-mm-dd hh:mm";
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: "top", wrapText: true };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const couple = [data.site.groom, data.site.bride].filter(Boolean).join("-");
    const safeName = couple.replace(/[^a-zA-Zа-яА-ЯёЁ0-9_-]+/g, "-").replace(/^-|-$/g, "");

    return {
      buffer: Buffer.from(buffer),
      filename: `rsvp-${safeName || siteId}.xlsx`,
    };
  }

  async getMusic(id: string, requesterId: string | null = null): Promise<ServedMedia> {
    const site = await this.inviteSites.getInviteSite(id);

    if (!site?.invite.musicEnabled || !site.invite.musicUrl) {
      throw new NotFoundException("Music file not found");
    }

    this.assertMediaAccess(site, requesterId);

    return resolveStoredMedia(site.invite.musicUrl, this.s3Storage, "Music file not found");
  }

  async getImage(
    id: string,
    slot: string,
    requesterId: string | null = null,
  ): Promise<ServedMedia> {
    if (!isInviteImageSlot(slot)) {
      throw new NotFoundException("Image file not found");
    }

    const site = await this.inviteSites.getInviteSite(id);

    if (!site) {
      throw new NotFoundException("Image file not found");
    }

    this.assertMediaAccess(site, requesterId);

    const imageUrl = site.invite[getImageFieldForSlot(slot)];

    if (!imageUrl) {
      throw new NotFoundException("Image file not found");
    }

    return resolveStoredMedia(imageUrl, this.s3Storage, "Image file not found");
  }

  private assertMediaAccess(
    site: { isPublished: boolean; ownerId: string | null },
    requesterId: string | null,
  ) {
    if (site.isPublished) {
      return;
    }

    if (requesterId && site.ownerId === requesterId) {
      return;
    }

    throw new NotFoundException("Media file not found");
  }

  private async prepareSitePayload(payload: CreateInviteSitePayload) {
    this.assertStoredMediaUrls(payload);
    const payloadWithImages = await this.uploadInviteImagesIfNeeded(payload);

    return this.uploadInviteMusicIfNeeded(payloadWithImages);
  }

  private async assertKnownTemplate(templateId: string) {
    const template = await this.inviteTemplates.findInviteTemplate(templateId);

    if (!template) {
      throw new BadRequestException({ error: "Неизвестный шаблон приглашения." });
    }

    return template;
  }

  private parsePublishedFlag(body: unknown) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new BadRequestException({ error: "Некорректный статус сайта." });
    }

    const isPublished = (body as Record<string, unknown>).isPublished;

    if (typeof isPublished !== "boolean") {
      throw new BadRequestException({ error: "Некорректный статус сайта." });
    }

    return isPublished;
  }

  private async uploadInviteMusicIfNeeded(
    payload: CreateInviteSitePayload,
  ): Promise<CreateInviteSitePayload> {
    if (!payload.invite.musicEnabled || !payload.invite.musicUrl.startsWith("data:")) {
      return payload;
    }

    const parsedMusic = parseDataMusicUrl(payload.invite.musicUrl);

    if (!parsedMusic) {
      throw new InviteMusicUploadError();
    }

    if (!ALLOWED_AUDIO_MIME_TYPES.has(parsedMusic.mime.toLowerCase())) {
      throw new InviteMusicUploadError();
    }

    assertMediaFileSize(parsedMusic.buffer, "музыки");

    try {
      const musicUrl = await this.s3Storage.uploadInviteMusicObject({
        buffer: parsedMusic.buffer,
        contentType: parsedMusic.mime,
      });

      return {
        ...payload,
        invite: {
          ...payload.invite,
          musicUrl,
        },
      };
    } catch (error) {
      if (isS3NotConfiguredError(error)) {
        throw error;
      }

      throw new InviteMusicUploadError();
    }
  }

  private restoreExistingMediaRefs(
    siteId: string,
    payload: CreateInviteSitePayload,
    existingSite: PublishedInviteSite,
  ): CreateInviteSitePayload {
    const invite = { ...payload.invite };

    for (const { field, slot } of INVITE_IMAGE_SLOTS) {
      if (invite[field] === `/api/sites/${siteId}/images/${slot}`) {
        invite[field] = existingSite.invite[field];
      }
    }

    if (invite.musicUrl === `/api/sites/${siteId}/music`) {
      invite.musicUrl = existingSite.invite.musicUrl;
    }

    return {
      ...payload,
      invite,
    };
  }

  private async getOwnedSite(ownerId: string, siteId: string) {
    const site = await this.inviteSites.getInviteSite(siteId);

    if (!site) {
      throw new NotFoundException({ error: "Сайт не найден." });
    }

    if (site.ownerId !== ownerId) {
      throw new ForbiddenException({ error: "Нет доступа к этому сайту." });
    }

    return site;
  }

  private async uploadInviteImagesIfNeeded(
    payload: CreateInviteSitePayload,
  ): Promise<CreateInviteSitePayload> {
    let invite = payload.invite;

    for (const { field, slot } of INVITE_IMAGE_SLOTS) {
      const imageUrl = invite[field];

      if (!imageUrl.startsWith("data:")) {
        continue;
      }

      const parsedImage = parseDataUrl(imageUrl);

      if (!parsedImage || !ALLOWED_IMAGE_MIME_TYPES.has(parsedImage.mime.toLowerCase())) {
        throw new InviteImageUploadError();
      }

      assertMediaFileSize(parsedImage.buffer, "изображения");

      try {
        const uploadedUrl = await this.s3Storage.uploadInviteImageObject({
          buffer: parsedImage.buffer,
          contentType: parsedImage.mime,
          slot,
        });

        invite = {
          ...invite,
          [field]: uploadedUrl,
        };
      } catch (error) {
        if (isS3NotConfiguredError(error)) {
          throw error;
        }

        throw new InviteImageUploadError();
      }
    }

    return {
      ...payload,
      invite,
    };
  }

  private assertStoredMediaUrls(payload: CreateInviteSitePayload) {
    for (const { field } of INVITE_IMAGE_SLOTS) {
      assertAllowedStoredMediaUrl(payload.invite[field], field);
    }

    assertAllowedStoredMediaUrl(payload.invite.musicUrl, "musicUrl");
  }

  private toPublishedSiteForClient(site: PublishedInviteSite): PublishedInviteSite {
    return {
      createdAt: site.createdAt,
      id: site.id,
      invite: {
        ...site.invite,
        coverImageUrl: getPublicImageUrl(site.id, site.invite.coverImageUrl ?? "", "cover"),
        musicUrl: getPublicMusicUrl(site.id, site.invite.musicUrl),
        portraitImageUrl: getPublicImageUrl(
          site.id,
          site.invite.portraitImageUrl ?? "",
          "portrait",
        ),
        venueImageUrl: getPublicImageUrl(site.id, site.invite.venueImageUrl ?? "", "venue"),
      },
      palette: site.palette,
      templateId: site.templateId,
      updatedAt: site.updatedAt,
    };
  }
}
