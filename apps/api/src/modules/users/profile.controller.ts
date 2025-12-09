import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface AuthUser {
  id: string;
  email: string;
  role: string;
  salonId: string;
}

@Controller('profile')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /profile
   * Retorna o perfil do usuario logado
   */
  @Get()
  async getProfile(@CurrentUser() user: AuthUser) {
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
   * PATCH /profile
   * Atualiza o perfil do usuario logado
   */
  @Patch()
  async updateProfile(
    @CurrentUser() user: AuthUser,
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
   * POST /profile/change-password
   * Altera a senha do usuario logado
   */
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: AuthUser,
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
}