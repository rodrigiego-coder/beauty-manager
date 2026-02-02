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
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UpdateWorkScheduleDto, UpdateProfileDto, ChangePasswordDto } from './dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me
   * Retorna o perfil do usuario logado
   * (Alias para /profile - mesma logica)
   */
  @Get('me')
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    if (!user || !user.id) {
      throw new UnauthorizedException('Usuario nao autenticado');
    }

    const userData = await this.usersService.findById(user.id);

    if (!userData) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    const { passwordHash, ...profile } = userData;
    return profile;
  }

  /**
   * PATCH /users/me
   * Atualiza o perfil do usuario logado
   * (Alias para PATCH /profile - mesma logica)
   */
  @Patch('me')
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: UpdateProfileDto,
  ) {
    if (!user || !user.id) {
      throw new UnauthorizedException('Usuario nao autenticado');
    }

    const updatedUser = await this.usersService.updateProfile(user.id, data);

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
   * (Alias para POST /profile/change-password - mesma logica)
   */
  @Post('me/change-password')
  async changeMyPassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: ChangePasswordDto,
  ) {
    if (!user || !user.id) {
      throw new UnauthorizedException('Usuario nao autenticado');
    }

    return this.usersService.changePassword(
      user.id,
      data.currentPassword,
      data.newPassword,
    );
  }

  /**
   * GET /users
   * Lista usuarios do salão do usuario logado
   */
  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('includeInactive') includeInactive?: string,
  ) {
    console.log('[UsersController] findAll - user:', user?.id, 'salonId:', user?.salonId, 'includeInactive:', includeInactive);
    const result = await this.usersService.findAll(user?.salonId, includeInactive === 'true');
    console.log('[UsersController] findAll - returning', result.length, 'users');
    return result;
  }

  /**
   * GET /users/professionals
   * Lista apenas profissionais ativos do salão
   */
  @Get('professionals')
  async findProfessionals(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findProfessionals(user?.salonId);
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
   * Se criado sem senha e com telefone, envia link de criacao de senha via WhatsApp
   */
  @Post()
  async create(@Body() data: CreateUserDto) {
    const { sendPasswordLink, ...userData } = data;
    const user = await this.usersService.create(userData as any);

    // Se não tem senha e tem telefone, envia link de criação de senha
    // sendPasswordLink: true por default se não vier senha, false se vier
    const shouldSendLink = sendPasswordLink !== false && !data.password && user.phone;

    if (shouldSendLink) {
      try {
        await this.usersService.sendPasswordCreationLink(user.id);
        return {
          ...user,
          message: 'Usuario criado. Link de criacao de senha enviado via WhatsApp.',
        };
      } catch (error) {
        // Se falhar o envio, ainda retorna o usuário criado
        console.error('Erro ao enviar link de senha:', error);
        return {
          ...user,
          message: 'Usuario criado. Falha ao enviar link via WhatsApp.',
        };
      }
    }

    return user;
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

  /**
   * POST /users/:id/send-password-link
   * Reenvia link de criacao de senha via WhatsApp
   */
  @Post(':id/send-password-link')
  async sendPasswordLink(@Param('id') id: string) {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    return this.usersService.sendPasswordCreationLink(id);
  }
}