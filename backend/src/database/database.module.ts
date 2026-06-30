import { Global, Module } from "@nestjs/common";
import { MongoDbService } from "./mongodb.service";

@Global()
@Module({
  exports: [MongoDbService],
  providers: [MongoDbService],
})
export class DatabaseModule {}
