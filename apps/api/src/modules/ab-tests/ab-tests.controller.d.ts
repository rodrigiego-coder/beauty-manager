import { ABTestsService } from './ab-tests.service';
import { CreateABTestDto, UpdateABTestDto, RecordConversionDto } from './dto';
export declare class ABTestsController {
    private readonly abTestsService;
    constructor(abTestsService: ABTestsService);
    getTests(req: any, page?: string, limit?: string, status?: string, testType?: string): Promise<{
        data: import("./dto").ABTestResponse[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStats(req: any): Promise<import("./dto").ABTestStatsResponse>;
    getTest(req: any, id: string): Promise<import("./dto").ABTestResponse>;
    getAssignments(req: any, id: string, page?: string, limit?: string, converted?: string): Promise<{
        data: import("./dto").ABTestAssignmentResponse[];
        total: number;
    }>;
    createTest(req: any, dto: CreateABTestDto): Promise<import("./dto").ABTestResponse>;
    updateTest(req: any, id: string, dto: UpdateABTestDto): Promise<import("./dto").ABTestResponse>;
    startTest(req: any, id: string): Promise<import("./dto").ABTestResponse>;
    pauseTest(req: any, id: string): Promise<import("./dto").ABTestResponse>;
    completeTest(req: any, id: string): Promise<import("./dto").ABTestResponse>;
    deleteTest(req: any, id: string): Promise<{
        success: boolean;
    }>;
    assignVariant(req: any, id: string, body: {
        clientId?: string;
        clientPhone?: string;
    }): Promise<{
        variant: string;
        testId: string;
    }>;
    recordConversion(req: any, dto: RecordConversionDto): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=ab-tests.controller.d.ts.map