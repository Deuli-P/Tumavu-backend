import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/auth-user.interface';
import { JobOfferService } from './job-offer.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';
import { ApplyJobOfferDto } from './dto/apply-job-offer.dto';
import { UpdateApplicationJobStatusDto } from './dto/update-application-job-status.dto';
import { ListJobOfferAdminDto } from './dto/list-job-offer-admin.dto';
import { ApplicationJobStatus, JobOfferStatus } from '@prisma/client';

@Controller('job-offer')
@UseGuards(AuthenticatedGuard)
export class JobOfferController {
  constructor(private readonly jobOfferService: JobOfferService) {}

  // ─── Manager CRUD ─────────────────────────────────────────────────────────

  @Post()
  create(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: CreateJobOfferDto,
  ) {
    return this.jobOfferService.create(user.userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query('status') status?: JobOfferStatus,
  ) {
    return this.jobOfferService.findAll(user.userId, status);
  }

  @Get('browse')
  browse(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query('countryId') countryId?: string,
    @Query('tagId') tagId?: string,
  ) {
    return this.jobOfferService.browse(user.userId, {
      countryId: countryId ? Number(countryId) : undefined,
      tagId: tagId ? Number(tagId) : undefined,
    });
  }

  @Get('admin')
  @UseGuards(AdminGuard)
  listAdmin(@Query() dto: ListJobOfferAdminDto) {
    return this.jobOfferService.listAdmin(dto);
  }

  @Get('admin/applications')
  @UseGuards(AdminGuard)
  listApplicationsAdmin(
    @Query('status') status?: ApplicationJobStatus,
    @Query('companyId') companyId?: string,
    @Query('stationId') stationId?: string,
  ) {
    return this.jobOfferService.listApplicationsAdmin({
      status,
      companyId,
      stationId: stationId ? Number(stationId) : undefined,
    });
  }

  @Get('my/applications')
  getMyApplications(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query('status') status?: ApplicationJobStatus,
  ) {
    return this.jobOfferService.getMyApplications(user.userId, status);
  }

  // Candidatures du travailleur connecté (worker-side)
  @Get('worker/applications')
  getWorkerApplications(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.jobOfferService.getWorkerApplications(user.userId);
  }

  // Missions actives du travailleur
  @Get('worker/jobs')
  getWorkerJobs(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.jobOfferService.getWorkerJobs(user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobOfferService.findOne(id);
  }

  @Put(':id')
  update(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJobOfferDto,
  ) {
    return this.jobOfferService.update(user.userId, id, dto);
  }

  @Put(':id/publish')
  publish(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.jobOfferService.publish(user.userId, id);
  }

  @Put(':id/close')
  close(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.jobOfferService.close(user.userId, id);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.jobOfferService.remove(user.userId, id);
  }

  // ─── Applications ─────────────────────────────────────────────────────────

  @Post(':id/apply')
  apply(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApplyJobOfferDto,
  ) {
    return this.jobOfferService.apply(user.userId, id, dto);
  }

  @Get(':id/applications')
  findApplications(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.jobOfferService.findApplications(user.userId, id);
  }

  @Put('applications/:applicationId/status')
  updateApplicationStatus(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Body() dto: UpdateApplicationJobStatusDto,
  ) {
    return this.jobOfferService.updateApplicationStatus(user.userId, applicationId, dto.status);
  }
}
