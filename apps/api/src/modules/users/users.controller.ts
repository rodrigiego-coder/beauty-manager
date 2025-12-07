import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { NewUser, WorkSchedule } from '../../database';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users
   * Lista todos os usuários ativos
   */
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  /**
   * GET /users/professionals
   * Lista apenas profissionais ativos
   */
  @Get('professionals')
  async findProfessionals() {
    return this.usersService.findProfessionals();
  }

  /**
   * GET /users/:id
   * Busca usuário por ID
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    return user;
  }

  /**
   * POST /users
   * Cria um novo usuário
   */
  @Post()
  async create(@Body() data: NewUser) {
    return this.usersService.create(data);
  }

  /**
   * PATCH /users/:id
   * Atualiza um usuário
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<NewUser>,
  ) {
    const user = await this.usersService.update(id, data);

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    return user;
  }

  /**
   * PATCH /users/:id/schedule
   * Atualiza o horário de trabalho do profissional
   */
  @Patch(':id/schedule')
  async updateSchedule(
    @Param('id') id: string,
    @Body() schedule: WorkSchedule,
  ) {
    const user = await this.usersService.updateWorkSchedule(id, schedule);

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    return user;
  }

  /**
   * DELETE /users/:id
   * Desativa um usuário (soft delete)
   */
  @Delete(':id')
  async deactivate(@Param('id') id: string) {
    const user = await this.usersService.deactivate(id);

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    return { message: 'Usuario desativado com sucesso' };
  }
}
