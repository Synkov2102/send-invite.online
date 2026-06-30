import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { Response } from "express";
import { getBearerToken, getSessionToken } from "../auth/bearer-token";
import { AuthService } from "../auth/auth.service";
import { sendServedMedia } from "./send-served-media";
import { SitesService } from "./sites.service";

@Controller("sites")
export class SitesController {
  constructor(
    private readonly authService: AuthService,
    private readonly sitesService: SitesService,
  ) {}

  @Post()
  async createSite(
    @Body() body: unknown,
    @Headers("authorization") authorization?: string,
  ) {
    const user = await this.authService.getCurrentUser(getBearerToken(authorization));

    if (!user) {
      throw new UnauthorizedException({
        error: "Войдите в аккаунт, чтобы создать сайт.",
      });
    }

    return this.sitesService.createSite(body, user.id);
  }

  @Get("mine")
  async getOwnedSites(@Headers("authorization") authorization?: string) {
    const user = await this.getUserOrThrow(authorization);

    return this.sitesService.getOwnedSites(user.id);
  }

  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Post(":id/responses")
  saveResponse(@Param("id") id: string, @Body() body: unknown) {
    return this.sitesService.saveResponse(id, body);
  }

  @Get(":id/manage")
  async getManagedSite(
    @Param("id") id: string,
    @Headers("authorization") authorization?: string,
  ) {
    const user = await this.getUserOrThrow(authorization);

    return this.sitesService.getManagedSite(user.id, id);
  }

  @Patch(":id")
  async updateSite(
    @Param("id") id: string,
    @Body() body: unknown,
    @Headers("authorization") authorization?: string,
  ) {
    const user = await this.getUserOrThrow(authorization);

    return this.sitesService.updateSite(user.id, id, body);
  }

  @Patch(":id/visibility")
  async setSitePublished(
    @Param("id") id: string,
    @Body() body: unknown,
    @Headers("authorization") authorization?: string,
  ) {
    const user = await this.getUserOrThrow(authorization);

    return this.sitesService.setSitePublished(user.id, id, body);
  }

  @Get(":id/responses")
  async getResponses(
    @Param("id") id: string,
    @Headers("authorization") authorization?: string,
  ) {
    const user = await this.getUserOrThrow(authorization);

    return this.sitesService.getResponses(user.id, id);
  }

  @Get(":id/responses/export")
  async exportResponses(
    @Param("id") id: string,
    @Headers("authorization") authorization: string | undefined,
    @Res() response: Response,
  ) {
    const user = await this.getUserOrThrow(authorization);
    const exported = await this.sitesService.exportResponses(user.id, id);

    response
      .set({
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(exported.filename)}`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      .send(exported.buffer);
  }

  @Get(":id")
  async getSite(@Param("id") id: string) {
    const site = await this.sitesService.getPublishedSiteForClient(id);

    if (!site) {
      throw new NotFoundException("Site not found");
    }

    return site;
  }

  @Get(":id/music")
  async getMusic(
    @Param("id") id: string,
    @Headers("authorization") authorization: string | undefined,
    @Headers("cookie") cookieHeader: string | undefined,
    @Res() response: Response,
  ) {
    const requesterId = await this.getOptionalUserId(authorization, cookieHeader);
    sendServedMedia(response, await this.sitesService.getMusic(id, requesterId));
  }

  @Get(":id/images/:slot")
  async getImage(
    @Param("id") id: string,
    @Param("slot") slot: string,
    @Headers("authorization") authorization: string | undefined,
    @Headers("cookie") cookieHeader: string | undefined,
    @Res() response: Response,
  ) {
    const requesterId = await this.getOptionalUserId(authorization, cookieHeader);
    sendServedMedia(response, await this.sitesService.getImage(id, slot, requesterId));
  }

  private async getOptionalUserId(authorization?: string, cookieHeader?: string) {
    const user = await this.authService.getCurrentUser(
      getSessionToken(authorization, cookieHeader),
    );

    return user?.id ?? null;
  }

  private async getUserOrThrow(authorization?: string) {
    const user = await this.authService.getCurrentUser(getBearerToken(authorization));

    if (!user) {
      throw new UnauthorizedException({
        error: "Войдите в аккаунт.",
      });
    }

    return user;
  }
}
