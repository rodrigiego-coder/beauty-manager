import { CreateABTestDto, UpdateABTestDto, RecordConversionDto, ABTestResponse, ABTestAssignmentResponse, ABTestStatsResponse } from './dto';
export declare class ABTestsService {
    getTests(salonId: string, options?: {
        page?: number;
        limit?: number;
        status?: string;
        testType?: string;
    }): Promise<{
        data: ABTestResponse[];
        total: number;
        page: number;
        limit: number;
    }>;
    getTestById(salonId: string, id: string): Promise<ABTestResponse>;
    createTest(salonId: string, dto: CreateABTestDto): Promise<ABTestResponse>;
    updateTest(salonId: string, id: string, dto: UpdateABTestDto): Promise<ABTestResponse>;
    startTest(salonId: string, id: string): Promise<ABTestResponse>;
    pauseTest(salonId: string, id: string): Promise<ABTestResponse>;
    completeTest(salonId: string, id: string): Promise<ABTestResponse>;
    deleteTest(salonId: string, id: string): Promise<void>;
    assignVariant(salonId: string, testId: string, clientId?: string, clientPhone?: string): Promise<{
        variant: string;
        testId: string;
    }>;
    recordConversion(salonId: string, dto: RecordConversionDto): Promise<void>;
    getAssignments(salonId: string, testId: string, options?: {
        page?: number;
        limit?: number;
        converted?: boolean;
    }): Promise<{
        data: ABTestAssignmentResponse[];
        total: number;
    }>;
    getStats(salonId: string): Promise<ABTestStatsResponse>;
    private formatTestResponse;
}
//# sourceMappingURL=ab-tests.service.d.ts.map