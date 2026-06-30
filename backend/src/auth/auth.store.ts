import { randomBytes, randomUUID, createHash } from "crypto";
import { Injectable } from "@nestjs/common";
import { lazyOnce } from "../database/lazy-once";
import { MongoDbService } from "../database/mongodb.service";
import type { AuthUser, YandexUserInfo } from "./auth.types";

type UserDocument = AuthUser & {
  _id: string;
};

type SessionDocument = {
  _id: string;
  createdAt: string;
  expiresAt: Date;
  id: string;
  tokenHash: string;
  updatedAt: string;
  userId: string;
};

type CreatedSession = {
  expiresAt: string;
  token: string;
  user: AuthUser;
};

function getAvatarUrl(userInfo: YandexUserInfo) {
  if (!userInfo.default_avatar_id) {
    return null;
  }

  return `https://avatars.yandex.net/get-yapic/${userInfo.default_avatar_id}/islands-200`;
}

function getDisplayName(userInfo: YandexUserInfo) {
  return (
    userInfo.display_name ||
    userInfo.real_name ||
    [userInfo.first_name, userInfo.last_name].filter(Boolean).join(" ") ||
    userInfo.login
  );
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function toUser(document: UserDocument): AuthUser {
  return {
    avatarUrl: document.avatarUrl,
    createdAt: document.createdAt,
    email: document.email,
    id: document.id,
    login: document.login,
    name: document.name,
    updatedAt: document.updatedAt,
    yandexId: document.yandexId,
  };
}

@Injectable()
export class AuthStore {
  private readonly ensureIndexes = lazyOnce(() => this.ensureAuthIndexes());

  constructor(private readonly mongoDb: MongoDbService) {}

  private async getUsersCollection() {
    const db = await this.mongoDb.getDb();

    return db.collection<UserDocument>("users");
  }

  private async getSessionsCollection() {
    const db = await this.mongoDb.getDb();

    return db.collection<SessionDocument>("auth_sessions");
  }

  private async ensureAuthIndexes() {
    const users = await this.getUsersCollection();
    const sessions = await this.getSessionsCollection();

    await users.createIndex({ yandexId: 1 }, { unique: true });
    await users.createIndex({ email: 1 }, { sparse: true });
    await sessions.createIndex({ tokenHash: 1 }, { unique: true });
    await sessions.createIndex({ userId: 1 });
    await sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  }

  async upsertYandexUser(userInfo: YandexUserInfo): Promise<AuthUser> {
    await this.ensureIndexes();

    const now = new Date().toISOString();
    const users = await this.getUsersCollection();
    const existing = await users.findOne({ yandexId: userInfo.id });
    const user: AuthUser = {
      avatarUrl: getAvatarUrl(userInfo),
      createdAt: existing?.createdAt ?? now,
      email: userInfo.default_email ?? userInfo.emails?.[0] ?? null,
      id: existing?.id ?? randomUUID(),
      login: userInfo.login,
      name: getDisplayName(userInfo),
      updatedAt: now,
      yandexId: userInfo.id,
    };

    await users.updateOne(
      { yandexId: userInfo.id },
      {
        $set: user,
        $setOnInsert: {
          _id: user.id,
        },
      },
      { upsert: true },
    );

    return user;
  }

  async createSession(user: AuthUser): Promise<CreatedSession> {
    await this.ensureIndexes();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const token = randomBytes(32).toString("base64url");
    const sessions = await this.getSessionsCollection();
    const sessionId = randomUUID();

    await sessions.insertOne({
      _id: sessionId,
      createdAt: now.toISOString(),
      expiresAt,
      id: sessionId,
      tokenHash: hashToken(token),
      updatedAt: now.toISOString(),
      userId: user.id,
    });

    return {
      expiresAt: expiresAt.toISOString(),
      token,
      user,
    };
  }

  async getUserBySessionToken(token: string): Promise<AuthUser | null> {
    if (!token) {
      return null;
    }

    await this.ensureIndexes();

    const sessions = await this.getSessionsCollection();
    const session = await sessions.findOne({
      expiresAt: { $gt: new Date() },
      tokenHash: hashToken(token),
    });

    if (!session) {
      return null;
    }

    const users = await this.getUsersCollection();
    const user = await users.findOne({ id: session.userId });

    return user ? toUser(user) : null;
  }

  async deleteSession(token: string) {
    if (!token) {
      return;
    }

    await this.ensureIndexes();

    const sessions = await this.getSessionsCollection();

    await sessions.deleteOne({ tokenHash: hashToken(token) });
  }
}
