import { BadRequestException, Injectable } from "@nestjs/common";
import { AuthStore } from "./auth.store";
import { YandexIdService } from "./yandex-id.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly authStore: AuthStore,
    private readonly yandexId: YandexIdService,
  ) {}

  async createYandexSession(body: unknown) {
    const payload = this.parseYandexCallbackPayload(body);
    const accessToken = await this.yandexId.exchangeCodeForToken(payload);
    const yandexUser = await this.yandexId.getUserInfo(accessToken);
    const user = await this.authStore.upsertYandexUser(yandexUser);

    return this.authStore.createSession(user);
  }

  getCurrentUser(token: string) {
    return this.authStore.getUserBySessionToken(token);
  }

  logout(token: string) {
    return this.authStore.deleteSession(token);
  }

  private parseYandexCallbackPayload(body: unknown) {
    if (!body || typeof body !== "object") {
      throw new BadRequestException("Invalid auth payload.");
    }

    const record = body as Record<string, unknown>;
    const code = typeof record.code === "string" ? record.code.trim() : "";
    const codeVerifier =
      typeof record.codeVerifier === "string" ? record.codeVerifier.trim() : "";
    const redirectUri =
      typeof record.redirectUri === "string" ? record.redirectUri.trim() : "";

    if (!code) {
      throw new BadRequestException("Auth code is required.");
    }

    if (codeVerifier.length < 43 || codeVerifier.length > 128) {
      throw new BadRequestException("Invalid PKCE code verifier.");
    }

    if (!redirectUri) {
      throw new BadRequestException("Redirect URI is required.");
    }

    this.assertAllowedRedirectUri(redirectUri);

    return {
      code,
      codeVerifier,
      redirectUri,
    };
  }

  private assertAllowedRedirectUri(redirectUri: string) {
    const allowed = new Set(
      [
        process.env.YANDEX_REDIRECT_URI,
        process.env.FRONTEND_ORIGIN
          ? new URL("/api/auth/yandex/callback", process.env.FRONTEND_ORIGIN).toString()
          : null,
      ].filter((value): value is string => Boolean(value)),
    );

    if (!allowed.has(redirectUri)) {
      throw new BadRequestException("Redirect URI is not allowed.");
    }

    try {
      const parsed = new URL(redirectUri);

      if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") {
        throw new BadRequestException("Redirect URI must use HTTPS.");
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException("Redirect URI is invalid.");
    }
  }
}
