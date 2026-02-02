import { SaveRecipeDto, RecipeResponse } from './dto';
export declare class RecipesService {
    private db;
    constructor(db: any);
    /**
     * Busca a receita ATIVA de um serviço
     */
    getActiveRecipe(serviceId: number, salonId: string): Promise<RecipeResponse | null>;
    /**
     * Busca receita por ID
     */
    getRecipeById(recipeId: string, salonId: string): Promise<RecipeResponse | null>;
    /**
     * Lista todas as versões de receita de um serviço
     */
    getRecipeHistory(serviceId: number, salonId: string): Promise<RecipeResponse[]>;
    /**
     * Salva receita (cria nova versão se já existir)
     */
    saveRecipe(serviceId: number, salonId: string, userId: string, data: SaveRecipeDto): Promise<RecipeResponse>;
    /**
     * Deleta receita (marca como ARCHIVED)
     */
    deleteRecipe(recipeId: string, salonId: string): Promise<void>;
    /**
     * Calcula o custo total da receita
     */
    private calculateRecipeCost;
    /**
     * Constrói response completa da receita
     */
    private buildRecipeResponse;
}
//# sourceMappingURL=recipes.service.d.ts.map