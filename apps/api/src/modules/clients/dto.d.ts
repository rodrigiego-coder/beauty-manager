import { ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
/**
 * Validador customizado para nome completo (mínimo 2 palavras)
 */
export declare class IsFullNameConstraint implements ValidatorConstraintInterface {
    validate(name: string, _args: ValidationArguments): boolean;
    defaultMessage(_args: ValidationArguments): string;
}
/**
 * Validador customizado para telefone brasileiro (10-11 dígitos)
 */
export declare class IsBrazilianPhoneConstraint implements ValidatorConstraintInterface {
    validate(phone: string, _args: ValidationArguments): boolean;
    defaultMessage(_args: ValidationArguments): string;
}
/**
 * DTO para criar cliente
 */
export declare class CreateClientDto {
    name: string;
    phone: string;
    email?: string;
    technicalNotes?: string;
    preferences?: string;
    aiActive?: boolean;
}
/**
 * DTO para atualizar cliente
 */
export declare class UpdateClientDto {
    name?: string;
    phone?: string;
    email?: string;
    technicalNotes?: string;
    preferences?: string;
    aiActive?: boolean;
}
//# sourceMappingURL=dto.d.ts.map