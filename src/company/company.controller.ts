import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/auth-user.interface';
import { CompanyService, CompanyPayload, CompanyListItem, CompanyDetail } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateCompanyWithOwnerDto } from './dto/create-company-with-owner.dto';
import { UpsertOptionsDto } from './dto/upsert-options.dto';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';
import { UpdateMyCompanyDto } from './dto/update-my-company.dto';

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

  @Get('admin')
  @UseGuards(AdminGuard)
  listCompanies(): Promise<CompanyListItem[]> {
    return this.companyService.listCompanies();
  }

  @Post('admin')
  @UseGuards(AuthenticatedGuard, AdminGuard)
  createCompanyWithOwner(@Body() dto: CreateCompanyWithOwnerDto): Promise<CompanyPayload> {
    return this.companyService.createCompanyWithOwner(dto);
  }

  @Get('admin/:id')
  @UseGuards(AdminGuard)
  findOneAdmin(@Param('id') id: string): Promise<CompanyDetail> {
    return this.companyService.findOneAdmin(id);
  }

  // ─── Manager: my company ──────────────────────────────────────────────────

  @Get('my')
  findMyCompany(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.companyService.findMyCompany(user.userId);
  }

  @Put('my')
  updateMyCompany(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: UpdateMyCompanyDto,
  ) {
    return this.companyService.updateMyCompany(user.userId, dto);
  }

  @Get('my/stats')
  getMyStats(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.companyService.getMyStats(user.userId);
  }

  @Get('my/employees')
  getMyEmployees(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.companyService.getMyEmployees(user.userId);
  }

  @Get('my/applications')
  getMyApplications(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query('status') status?: string,
  ) {
    return this.companyService.getMyApplications(user.userId, status);
  }

  @Get('my/tags')
  getTags() {
    return this.companyService.getTags();
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
