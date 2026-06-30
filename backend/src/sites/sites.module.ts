import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { S3StorageService } from "../storage/s3-storage.service";
import { InviteResponseStore } from "./invite-response.store";
import { InviteSiteStore } from "./invite-site.store";
import { InviteTemplateStore } from "./invite-template.store";
import { SitesController } from "./sites.controller";
import { SitesService } from "./sites.service";

@Module({
  controllers: [SitesController],
  imports: [AuthModule],
  providers: [
    InviteResponseStore,
    InviteSiteStore,
    InviteTemplateStore,
    S3StorageService,
    SitesService,
  ],
})
export class SitesModule {}
