import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  NotFoundException,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { PackagesService, CreatePackageDto } from './packages.service';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  /**
   * GET /packages
   * List all active packages for a salon
   */
  @Get()
  async findAll(@Query('salonId') salonId: string) {
    if (!salonId) {
      throw new BadRequestException('salonId is required');
    }
    return this.packagesService.findAll(salonId);
  }

  /**
   * GET /packages/:id
   * Find package by ID with services
   */
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const pkg = await this.packagesService.findById(id);

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    return pkg;
  }

  /**
   * GET /packages/:id/services
   * Get services included in a package
   */
  @Get(':id/services')
  async getPackageServices(@Param('id', ParseIntPipe) id: number) {
    const pkg = await this.packagesService.findById(id);

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    return this.packagesService.getPackageServices(id);
  }

  /**
   * POST /packages
   * Create a new package with services
   */
  @Post()
  async create(@Body() data: CreatePackageDto) {
    return this.packagesService.create(data);
  }

  /**
   * PATCH /packages/:id
   * Update a package
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Omit<CreatePackageDto, 'salonId'>>,
  ) {
    const pkg = await this.packagesService.update(id, data);

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    return pkg;
  }

  /**
   * DELETE /packages/:id
   * Deactivate a package (soft delete)
   */
  @Delete(':id')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    const pkg = await this.packagesService.deactivate(id);

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    return { message: 'Package deactivated successfully' };
  }

  /**
   * POST /packages/:id/check-service/:serviceId
   * Check if a service is included in a package
   */
  @Get(':id/check-service/:serviceId')
  async isServiceIncluded(
    @Param('id', ParseIntPipe) id: number,
    @Param('serviceId', ParseIntPipe) serviceId: number,
  ) {
    const isIncluded = await this.packagesService.isServiceIncluded(id, serviceId);
    const sessions = await this.packagesService.getSessionsForService(id, serviceId);

    return {
      isIncluded,
      sessionsIncluded: sessions,
    };
  }
}
