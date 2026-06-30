import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import type { YandexUserInfo } from "./auth.types";

type YandexTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
};

@Injectable()
export class YandexIdService {
  private getClientId() {
    const clientId = process.env.YANDEX_CLIENT_ID;

    if (!clientId) {
      throw new InternalServerErrorException("YANDEX_CLIENT_ID is not configured.");
    }

    return clientId;
  }

  private getClientSecret() {
    const clientSecret = process.env.YANDEX_CLIENT_SECRET;

    if (!clientSecret) {
      throw new InternalServerErrorException("YANDEX_CLIENT_SECRET is not configured.");
    }

    return clientSecret;
  }

  async exchangeCodeForToken(params: {
    code: string;
    codeVerifier: string;
    redirectUri: string;
  }) {
    const body = new URLSearchParams({
      client_id: this.getClientId(),
      client_secret: this.getClientSecret(),
      code: params.code,
      code_verifier: params.codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: params.redirectUri,
    });

    const response = await fetch("https://oauth.yandex.com/token", {
      body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });
    const data = (await response.json()) as YandexTokenResponse;

    if (!response.ok || !data.access_token) {
      throw new UnauthorizedException(
        data.error_description || data.error || "Yandex authorization failed.",
      );
    }

    return data.access_token;
  }

  async getUserInfo(accessToken: string): Promise<YandexUserInfo> {
    const response = await fetch("https://login.yandex.ru/info?format=json", {
      headers: {
        Authorization: `OAuth ${accessToken}`,
      },
    });
    const data = (await response.json()) as Partial<YandexUserInfo> & {
      error?: string;
      error_description?: string;
    };

    if (!response.ok || !data.id || !data.login) {
      throw new UnauthorizedException(
        data.error_description || data.error || "Yandex profile request failed.",
      );
    }

    return data as YandexUserInfo;
  }
}
