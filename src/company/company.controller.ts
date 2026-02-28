import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/auth-user.interface';
import { CompanyService, CompanyPayload } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpsertOptionsDto } from './dto/upsert-options.dto';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';

@Controller('company')
@UseGuards(AuthenticatedGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  // ─── Company ──────────────────────────────────────────────────────────────

  @Post()
  createCompany(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: CreateCompanyDto,
  ): Promise<CompanyPayload> {
    return this.companyService.createCompany(user.userId, dto);
  }

  // ─── Options ──────────────────────────────────────────────────────────────

  @Put(':id/options')
  upsertOptions(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() dto: UpsertOptionsDto,
  ) {
    return this.companyService.upsertOptions(user.userId, id, dto);
  }

  @Get(':id/options')
  getOptions(@Param('id') id: string) {
    return this.companyService.getOptions(id);
  }

  // ─── Avantages ────────────────────────────────────────────────────────────

  @Post(':id/benefit')
  createBenefit(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() dto: CreateBenefitDto,
  ) {
    return this.companyService.createBenefit(user.userId, id, dto);
  }

  @Get(':id/benefit')
  getBenefits(@Param('id') id: string) {
    return this.companyService.getBenefits(id);
  }

  @Put(':id/benefit/:benefitId')
  updateBenefit(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Param('benefitId', ParseIntPipe) benefitId: number,
    @Body() dto: UpdateBenefitDto,
  ) {
    return this.companyService.updateBenefit(user.userId, id, benefitId, dto);
  }

  @Delete(':id/benefit/:benefitId')
  deleteBenefit(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Param('benefitId', ParseIntPipe) benefitId: number,
  ): Promise<void> {
    return this.companyService.deleteBenefit(user.userId, id, benefitId);
  }
}
