import { IsEmail, IsOptional, IsString, MaxLength } from "class-validator"
import { Expose } from "class-transformer"
import { ValidationsGroupsEnum } from "../../shared/types/validations-groups-enum"
import { EnforceLowerCase } from "../../shared/decorators/enforceLowerCase.decorator"

export class LoginDto {
  @Expose()
  @IsEmail({}, { groups: [ValidationsGroupsEnum.default] })
  @EnforceLowerCase()
  email: string

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  password: string

  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(16, { groups: [ValidationsGroupsEnum.default] })
  mfaCode?: string
}
