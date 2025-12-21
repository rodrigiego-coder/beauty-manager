import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import {
  serviceRecipes,
  serviceRecipeLines,
  recipeVariants,
  products,
  services,
} from '../../database/schema';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  SaveRecipeDto,
  RecipeResponse,
  RecipeLineResponse,
  RecipeVariantResponse,
} from './dto';

@Injectable()
export class RecipesService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  /**
   * Busca a receita ATIVA de um serviço
   */
  async getActiveRecipe(
    serviceId: number,
    salonId: string,
  ): Promise<RecipeResponse | null> {
    const [recipe] = await this.db
      .select()
      .from(serviceRecipes)
      .where(
        and(
          eq(serviceRecipes.serviceId, serviceId),
          eq(serviceRecipes.salonId, salonId),
          eq(serviceRecipes.status, 'ACTIVE'),
        ),
      )
      .limit(1);

    if (!recipe) {
      return null;
    }

    return this.buildRecipeResponse(recipe);
  }

  /**
   * Busca receita por ID
   */
  async getRecipeById(
    recipeId: string,
    salonId: string,
  ): Promise<RecipeResponse | null> {
    const [recipe] = await this.db
      .select()
      .from(serviceRecipes)
      .where(
        and(
          eq(serviceRecipes.id, recipeId),
          eq(serviceRecipes.salonId, salonId),
        ),
      )
      .limit(1);

    if (!recipe) {
      return null;
    }

    return this.buildRecipeResponse(recipe);
  }

  /**
   * Lista todas as versões de receita de um serviço
   */
  async getRecipeHistory(
    serviceId: number,
    salonId: string,
  ): Promise<RecipeResponse[]> {
    const recipes = await this.db
      .select()
      .from(serviceRecipes)
      .where(
        and(
          eq(serviceRecipes.serviceId, serviceId),
          eq(serviceRecipes.salonId, salonId),
        ),
      )
      .orderBy(desc(serviceRecipes.version));

    return Promise.all(recipes.map((r: any) => this.buildRecipeResponse(r)));
  }

  /**
   * Salva receita (cria nova versão se já existir)
   */
  async saveRecipe(
    serviceId: number,
    salonId: string,
    userId: string,
    data: SaveRecipeDto,
  ): Promise<RecipeResponse> {
    // Verificar se serviço existe
    const [service] = await this.db
      .select()
      .from(services)
      .where(and(eq(services.id, serviceId), eq(services.salonId, salonId)))
      .limit(1);

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    // Validar produtos (devem ser isBackbar = true)
    for (const line of data.lines) {
      const [product] = await this.db
        .select()
        .from(products)
        .where(eq(products.id, line.productId))
        .limit(1);

      if (!product) {
        throw new BadRequestException(
          `Produto ID ${line.productId} não encontrado`,
        );
      }

      if (!product.isBackbar) {
        throw new BadRequestException(
          `Produto "${product.name}" não está marcado como "Uso em Serviços". ` +
            `Apenas produtos backbar podem ser usados em receitas.`,
        );
      }
    }

    // Buscar receita ativa atual (se existir)
    const [currentRecipe] = await this.db
      .select()
      .from(serviceRecipes)
      .where(
        and(
          eq(serviceRecipes.serviceId, serviceId),
          eq(serviceRecipes.salonId, salonId),
          eq(serviceRecipes.status, 'ACTIVE'),
        ),
      )
      .limit(1);

    let newVersion = 1;

    // Se existe receita ativa, arquivar ela
    if (currentRecipe) {
      await this.db
        .update(serviceRecipes)
        .set({
          status: 'ARCHIVED',
          updatedAt: new Date(),
        })
        .where(eq(serviceRecipes.id, currentRecipe.id));

      newVersion = currentRecipe.version + 1;
    }

    // Calcular custo estimado
    const estimatedCost = await this.calculateRecipeCost(data.lines);

    // Criar nova receita
    const [newRecipe] = await this.db
      .insert(serviceRecipes)
      .values({
        salonId,
        serviceId,
        version: newVersion,
        status: 'ACTIVE',
        effectiveFrom: new Date().toISOString().split('T')[0],
        notes: data.notes,
        estimatedCost: estimatedCost.toString(),
        targetMarginPercent: (data.targetMarginPercent || 60).toString(),
        createdById: userId,
      })
      .returning();

    // Inserir linhas
    if (data.lines.length > 0) {
      await this.db.insert(serviceRecipeLines).values(
        data.lines.map((line, index) => ({
          recipeId: newRecipe.id,
          productId: line.productId,
          productGroupId: line.productGroupId || null,
          quantityStandard: line.quantityStandard.toString(),
          quantityBuffer: (line.quantityBuffer || 0).toString(),
          unit: line.unit,
          isRequired: line.isRequired ?? true,
          notes: line.notes || null,
          sortOrder: line.sortOrder ?? index,
        })),
      );
    }

    // Inserir variações (se houver)
    if (data.variants && data.variants.length > 0) {
      await this.db.insert(recipeVariants).values(
        data.variants.map((variant, index) => ({
          recipeId: newRecipe.id,
          code: variant.code,
          name: variant.name,
          multiplier: variant.multiplier.toString(),
          isDefault: variant.isDefault ?? false,
          sortOrder: variant.sortOrder ?? index,
        })),
      );
    } else {
      // Criar variação DEFAULT se nenhuma foi especificada
      await this.db.insert(recipeVariants).values({
        recipeId: newRecipe.id,
        code: 'DEFAULT',
        name: 'Padrão',
        multiplier: '1',
        isDefault: true,
        sortOrder: 0,
      });
    }

    return this.buildRecipeResponse(newRecipe);
  }

  /**
   * Deleta receita (marca como ARCHIVED)
   */
  async deleteRecipe(recipeId: string, salonId: string): Promise<void> {
    const [recipe] = await this.db
      .select()
      .from(serviceRecipes)
      .where(
        and(
          eq(serviceRecipes.id, recipeId),
          eq(serviceRecipes.salonId, salonId),
        ),
      )
      .limit(1);

    if (!recipe) {
      throw new NotFoundException('Receita não encontrada');
    }

    await this.db
      .update(serviceRecipes)
      .set({
        status: 'ARCHIVED',
        updatedAt: new Date(),
      })
      .where(eq(serviceRecipes.id, recipeId));
  }

  /**
   * Calcula o custo total da receita
   */
  private async calculateRecipeCost(
    lines: {
      productId: number;
      quantityStandard: number;
      quantityBuffer?: number;
    }[],
  ): Promise<number> {
    let total = 0;

    for (const line of lines) {
      const [product] = await this.db
        .select()
        .from(products)
        .where(eq(products.id, line.productId))
        .limit(1);

      if (product) {
        const qty = line.quantityStandard + (line.quantityBuffer || 0);
        total += parseFloat(product.costPrice) * qty;
      }
    }

    return Math.round(total * 100) / 100;
  }

  /**
   * Constrói response completa da receita
   */
  private async buildRecipeResponse(recipe: any): Promise<RecipeResponse> {
    // Buscar serviço
    const [service] = await this.db
      .select()
      .from(services)
      .where(eq(services.id, recipe.serviceId))
      .limit(1);

    // Buscar linhas com dados do produto
    const lines = await this.db
      .select({
        line: serviceRecipeLines,
        product: products,
      })
      .from(serviceRecipeLines)
      .leftJoin(products, eq(serviceRecipeLines.productId, products.id))
      .where(eq(serviceRecipeLines.recipeId, recipe.id))
      .orderBy(serviceRecipeLines.sortOrder);

    // Buscar variações
    const variants = await this.db
      .select()
      .from(recipeVariants)
      .where(eq(recipeVariants.recipeId, recipe.id))
      .orderBy(recipeVariants.sortOrder);

    // Calcular custo base
    const baseCost = lines.reduce(
      (sum: number, { line, product }: { line: any; product: any }) => {
        const qty =
          parseFloat(line.quantityStandard) +
          parseFloat(line.quantityBuffer || '0');
        const cost = product ? parseFloat(product.costPrice) : 0;
        return sum + qty * cost;
      },
      0,
    );

    // Montar response das linhas
    const linesResponse: RecipeLineResponse[] = lines.map(
      ({ line, product }: { line: any; product: any }) => ({
        id: line.id,
        productId: line.productId,
        productName: product?.name || 'Produto não encontrado',
        productUnit: product?.unit || 'UN',
        productCost: product ? parseFloat(product.costPrice) : 0,
        productGroupId: line.productGroupId || undefined,
        quantityStandard: parseFloat(line.quantityStandard),
        quantityBuffer: parseFloat(line.quantityBuffer || '0'),
        unit: line.unit,
        isRequired: line.isRequired,
        notes: line.notes || undefined,
        sortOrder: line.sortOrder,
        lineCost:
          (parseFloat(line.quantityStandard) +
            parseFloat(line.quantityBuffer || '0')) *
          (product ? parseFloat(product.costPrice) : 0),
      }),
    );

    // Montar response das variações
    const variantsResponse: RecipeVariantResponse[] = variants.map(
      (v: any) => ({
        id: v.id,
        code: v.code,
        name: v.name,
        multiplier: parseFloat(v.multiplier),
        isDefault: v.isDefault,
        sortOrder: v.sortOrder,
        estimatedCost: Math.round(baseCost * parseFloat(v.multiplier) * 100) / 100,
      }),
    );

    return {
      id: recipe.id,
      serviceId: recipe.serviceId,
      serviceName: service?.name || 'Serviço não encontrado',
      version: recipe.version,
      status: recipe.status,
      effectiveFrom: recipe.effectiveFrom,
      notes: recipe.notes || undefined,
      estimatedCost: Math.round(baseCost * 100) / 100,
      targetMarginPercent: parseFloat(recipe.targetMarginPercent || '60'),
      lines: linesResponse,
      variants: variantsResponse,
      createdAt: recipe.createdAt?.toISOString(),
      updatedAt: recipe.updatedAt?.toISOString(),
    };
  }
}
