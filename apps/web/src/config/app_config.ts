/**
 * Configuração da aplicação - Constantes importantes
 *
 * ALWAYS_SHOW_IN_AGENDA: IDs de usuários que SEMPRE devem aparecer na agenda,
 * independente do role. Usado para proprietários que também são profissionais.
 */

export const APP_CONFIG = {
  // Camila Sanches (OWNER com isProfessional=true) - NUNCA remover da agenda
  ALWAYS_SHOW_IN_AGENDA: [
    '28d9e228-b1ff-455a-9eb2-e0489d0e971c', // Camila Sanches (OWNER)
    '33333333-3333-3333-3333-333333333333', // Camila Sanches (STYLIST - backup)
  ] as string[],
};

export type AppConfig = typeof APP_CONFIG;
