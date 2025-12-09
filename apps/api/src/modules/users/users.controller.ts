import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UpdateWorkScheduleDto, UpdateProfileDto, ChangePasswordDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me
   * Retorna o perfil do usuario logado
   */
  @Get('me')
  async getProfile(@CurrentUser() user: JwtPayload) {
    if (!user || !user.sub) {
      throw new UnauthorizedException('Usuario nao autenticado');
    }

    const userData = await this.usersService.findById(user.sub);

    if (!userData) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    const { passwordHash, ...profile } = userData;
    return profile;
  }

  /**
   * PATCH /users/me
   * Atualiza o perfil do usuario logado
   */
  @Patch('me')
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() data: UpdateProfileDto,
  ) {
    if (!user || !user.sub) {
      throw new UnauthorizedException('Usuario nao autenticado');
    }

    const updatedUser = await this.usersService.updateProfile(user.sub, data);

    if (!updatedUser) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    const { passwordHash, ...profile } = updatedUser;
    return {
      ...profile,
      message: 'Perfil atualizado com sucesso',
    };
  }

  /**
   * POST /users/me/change-password
   * Altera a senha do usuario logado
   */
  @Post('me/change-password')
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() data: ChangePasswordDto,
  ) {
    if (!user || !user.sub) {
      throw new UnauthorizedException('Usuario nao autenticado');
    }

    return this.usersService.changePassword(
      user.sub,
      data.currentPassword,
      data.newPassword,
    );
  }

  /**
   * GET /users
   * Lista todos os usuarios ativos
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
   * Busca usuario por ID
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
   * Cria um novo usuario
   */
  @Post()
  async create(@Body() data: CreateUserDto) {
    return this.usersService.create(data as any);
  }

  /**
   * PATCH /users/:id
   * Atualiza um usuario
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, data as any);

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    return user;
  }

  /**
   * PATCH /users/:id/schedule
   * Atualiza o horario de trabalho do profissional
   */
  @Patch(':id/schedule')
  async updateSchedule(
    @Param('id') id: string,
    @Body() schedule: UpdateWorkScheduleDto,
  ) {
    const user = await this.usersService.updateWorkSchedule(id, schedule as any);

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    return user;
  }

  /**
   * DELETE /users/:id
   * Desativa um usuario (soft delete)
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