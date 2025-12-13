import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ABTestsService } from './ab-tests.service';
import { CreateABTestDto, UpdateABTestDto, RecordConversionDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('ab-tests')
@UseGuards(AuthGuard, RolesGuard)
export class ABTestsController {
  constructor(private readonly abTestsService: ABTestsService) {}

  @Get()
  @Roles('OWNER', 'MANAGER')
  async getTests(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('testType') testType?: string,
  ) {
    return this.abTestsService.getTests(req.user.salonId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      testType,
    });
  }

  @Get('stats')
  @Roles('OWNER', 'MANAGER')
  async getStats(@Request() req: any) {
    return this.abTestsService.getStats(req.user.salonId);
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER')
  async getTest(@Request() req: any, @Param('id') id: string) {
    return this.abTestsService.getTestById(req.user.salonId, id);
  }

  @Get(':id/assignments')
  @Roles('OWNER', 'MANAGER')
  async getAssignments(
    @Request() req: any,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('converted') converted?: string,
  ) {
    return this.abTestsService.getAssignments(req.user.salonId, id, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      converted: converted !== undefined ? converted === 'true' : undefined,
    });
  }

  @Post()
  @Roles('OWNER', 'MANAGER')
  async createTest(@Request() req: any, @Body() dto: CreateABTestDto) {
    return this.abTestsService.createTest(req.user.salonId, dto);
  }

  @Patch(':id')
  @Roles('OWNER', 'MANAGER')
  async updateTest(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateABTestDto,
  ) {
    return this.abTestsService.updateTest(req.user.salonId, id, dto);
  }

  @Post(':id/start')
  @Roles('OWNER', 'MANAGER')
  async startTest(@Request() req: any, @Param('id') id: string) {
    return this.abTestsService.startTest(req.user.salonId, id);
  }

  @Post(':id/pause')
  @Roles('OWNER', 'MANAGER')
  async pauseTest(@Request() req: any, @Param('id') id: string) {
    return this.abTestsService.pauseTest(req.user.salonId, id);
  }

  @Post(':id/complete')
  @Roles('OWNER', 'MANAGER')
  async completeTest(@Request() req: any, @Param('id') id: string) {
    return this.abTestsService.completeTest(req.user.salonId, id);
  }

  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  async deleteTest(@Request() req: any, @Param('id') id: string) {
    await this.abTestsService.deleteTest(req.user.salonId, id);
    return { success: true };
  }

  // ==================== VARIANT ASSIGNMENT ====================

  @Post(':id/assign')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async assignVariant(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { clientId?: string; clientPhone?: string },
  ) {
    return this.abTestsService.assignVariant(
      req.user.salonId,
      id,
      body.clientId,
      body.clientPhone,
    );
  }

  @Post('convert')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async recordConversion(@Request() req: any, @Body() dto: RecordConversionDto) {
    await this.abTestsService.recordConversion(req.user.salonId, dto);
    return { success: true };
  }
}
