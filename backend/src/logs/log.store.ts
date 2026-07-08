import { Injectable } from "@nestjs/common";
import { lazyOnce } from "../database/lazy-once";
import { MongoDbService } from "../database/mongodb.service";

type LogLevel = "debug" | "info" | "warn" | "error";

type LogDocument = {
  _id: string;
  createdAt: Date;
  expiresAt?: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  source?: string;
};

@Injectable()
export class LogStore {
  private readonly ensureIndexes = lazyOnce(() => this.ensureLogIndexes());

  constructor(private readonly mongoDb: MongoDbService) {}

  private async getLogsCollection() {
    const db = await this.mongoDb.getDb();

    return db.collection<LogDocument>("logs");
  }

  private async ensureLogIndexes() {
    const logs = await this.getLogsCollection();

    await logs.createIndex({ createdAt: -1 });
    await logs.createIndex({ level: 1, createdAt: -1 });
    await logs.createIndex({ source: 1, createdAt: -1 });

    const retentionDays = Number(process.env.LOG_RETENTION_DAYS ?? "30");
    if (Number.isFinite(retentionDays) && retentionDays > 0) {
      const expireAfterSeconds = Math.floor(retentionDays * 24 * 60 * 60);
      await logs.createIndex({ expiresAt: 1 }, { expireAfterSeconds });
    }
  }

  async write(options: {
    level?: LogLevel;
    message: string;
    context?: Record<string, unknown>;
    source?: string;
  }) {
    await this.ensureIndexes();

    const logs = await this.getLogsCollection();
    const now = new Date();
    const retentionDays = Number(process.env.LOG_RETENTION_DAYS ?? "30");
    const expiresAt =
      Number.isFinite(retentionDays) && retentionDays > 0
        ? new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000)
        : undefined;

    await logs.insertOne({
      _id: `${options.source ?? "app"}:${now.getTime()}:${Math.random().toString(36).slice(2, 10)}`,
      createdAt: now,
      expiresAt,
      level: options.level ?? "info",
      message: options.message,
      context: options.context,
      source: options.source,
    });
  }
}

