import { Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
export interface JwtPayload {
    sub: string;
    id: string;
    email: string;
    role: string;
    salonId: string;
    type: 'access' | 'refresh';
    exp?: number;
    iat?: number;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly usersService;
    constructor(usersService: UsersService);
    validate(payload: JwtPayload): Promise<{
        sub: string;
        id: string;
        email: string;
        role: string;
        salonId: string;
    }>;
}
export {};
//# sourceMappingURL=jwt.strategy.d.ts.map