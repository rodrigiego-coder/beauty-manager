import { RecipesService } from './recipes.service';
import { SaveRecipeDto, RecipeResponse } from './dto';
interface CurrentUserPayload {
    id: string;
    salonId: string;
    role: string;
}
export declare class RecipesController {
    private readonly recipesService;
    constructor(recipesService: RecipesService);
    /**
     * GET /services/:serviceId/recipe
     * Busca a receita ATIVA de um serviço
     */
    getActiveRecipe(serviceId: number, user: CurrentUserPayload): Promise<RecipeResponse | null>;
    /**
     * GET /services/:serviceId/recipe/history
     * Lista todas as versões de receita de um serviço
     */
    getRecipeHistory(serviceId: number, user: CurrentUserPayload): Promise<RecipeResponse[]>;
    /**
     * PUT /services/:serviceId/recipe
     * Salva receita (cria nova versão se já existir)
     */
    saveRecipe(serviceId: number, data: SaveRecipeDto, user: CurrentUserPayload): Promise<RecipeResponse>;
    /**
     * DELETE /services/:serviceId/recipe
     * Arquiva a receita ativa
     */
    deleteRecipe(serviceId: number, user: CurrentUserPayload): Promise<{
        message: string;
    }>;
}
export {};
//# sourceMappingURL=recipes.controller.d.ts.map