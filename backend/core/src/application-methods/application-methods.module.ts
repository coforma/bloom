import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ApplicationMethodsService } from "./application-method.service"
import { ApplicationMethodsController } from "./application-methods.controller"
import { ApplicationMethod } from "../entity/application-method.entity"
import { AuthzService } from "../auth/authz.service"
import { AuthModule } from "../auth/auth.module"

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationMethod]), AuthModule],
  providers: [ApplicationMethodsService, AuthzService],
  exports: [ApplicationMethodsService],
  controllers: [ApplicationMethodsController],
})
export class ApplicationMethodsModule {}
