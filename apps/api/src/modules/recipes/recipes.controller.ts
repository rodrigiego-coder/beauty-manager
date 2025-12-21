import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RecipesService } from './recipes.service';
import { SaveRecipeDto, RecipeResponse } from './dto';

interface CurrentUserPayload {
  id: string;
  salonId: string;
  role: string;
}

@Controller('services')
@UseGuards(AuthGuard)
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  /**
   * GET /services/:serviceId/recipe
   * Busca a receita ATIVA de um serviço
   */
  @Get(':serviceId/recipe')
  @Roles('OWNER', 'MANAGER')
  async getActiveRecipe(
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<RecipeResponse | null> {
    return this.recipesService.getActiveRecipe(serviceId, user.salonId);
  }

  /**
   * GET /services/:serviceId/recipe/history
   * Lista todas as versões de receita de um serviço
   */
  @Get(':serviceId/recipe/history')
  @Roles('OWNER', 'MANAGER')
  async getRecipeHistory(
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<RecipeResponse[]> {
    return this.recipesService.getRecipeHistory(serviceId, user.salonId);
  }

  /**
   * PUT /services/:serviceId/recipe
   * Salva receita (cria nova versão se já existir)
   */
  @Put(':serviceId/recipe')
  @Roles('OWNER', 'MANAGER')
  async saveRecipe(
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @Body() data: SaveRecipeDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<RecipeResponse> {
    return this.recipesService.saveRecipe(
      serviceId,
      user.salonId,
      user.id,
      data,
    );
  }

  /**
   * DELETE /services/:serviceId/recipe
   * Arquiva a receita ativa
   */
  @Delete(':serviceId/recipe')
  @Roles('OWNER', 'MANAGER')
  async deleteRecipe(
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ message: string }> {
    const recipe = await this.recipesService.getActiveRecipe(
      serviceId,
      user.salonId,
    );

    if (!recipe) {
      return { message: 'Nenhuma receita ativa encontrada' };
    }

    await this.recipesService.deleteRecipe(recipe.id, user.salonId);
    return { message: 'Receita arquivada com sucesso' };
  }
}
