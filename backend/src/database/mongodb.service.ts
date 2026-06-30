import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { MongoClient, type Db } from "mongodb";

@Injectable()
export class MongoDbService implements OnModuleDestroy {
  private client: MongoClient | undefined;
  private clientPromise: Promise<MongoClient> | undefined;

  private getMongoClientPromise() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is not configured.");
    }

    this.clientPromise ??= new MongoClient(uri, {
      serverSelectionTimeoutMS: 7000,
    })
      .connect()
      .then((client) => {
        this.client = client;
        return client;
      });

    return this.clientPromise;
  }

  async getDb(): Promise<Db> {
    const client = await this.getMongoClientPromise();

    return client.db(process.env.MONGODB_DB ?? "invite");
  }

  async onModuleDestroy() {
    await this.client?.close();
  }
}
