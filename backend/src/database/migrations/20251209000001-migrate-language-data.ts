import { QueryInterface, DataTypes, QueryTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    try {
      // Buscar todas as empresas
      const companies = await queryInterface.sequelize.query(
        "SELECT id FROM \"Companies\"",
        { type: QueryTypes.SELECT }
      );

      // Para cada empresa, criar configurações padrão
      for (const company of companies as any[]) {
        // Verificar se já existe configuração
        const existing = await queryInterface.sequelize.query(
          "SELECT id FROM \"LanguageSettings\" WHERE \"companyId\" = :companyId",
          {
            replacements: { companyId: company.id },
            type: QueryTypes.SELECT
          }
        );

        if (!existing || existing.length === 0) {
          // Criar configuração padrão
          await queryInterface.sequelize.query(
            `INSERT INTO "LanguageSettings" 
            ("companyId", "systemLanguages", "featureEnabled", "createdAt", "updatedAt") 
            VALUES 
            (:companyId, :systemLanguages, :featureEnabled, NOW(), NOW())`,
            {
              replacements: {
                companyId: company.id,
                systemLanguages: JSON.stringify(["pt", "en", "es", "ar", "tr"]),
                featureEnabled: false // Inicialmente desabilitado para não quebrar sistema existente
              }
            }
          );
        }

        // Atualizar usuários da empresa com idioma padrão
        await queryInterface.sequelize.query(
          `UPDATE "Users" 
          SET "preferredLanguage" = COALESCE("preferredLanguage", 'pt'),
              "updatedAt" = NOW()
          WHERE "companyId" = :companyId AND "preferredLanguage" IS NULL`,
          {
            replacements: { companyId: company.id }
          }
        );

        // Para usuários admin, definir línguas disponíveis como null (herdar do super)
        await queryInterface.sequelize.query(
          `UPDATE "Users" 
          SET "adminSelectedLanguages" = NULL,
              "updatedAt" = NOW()
          WHERE "companyId" = :companyId AND "profile" = 'admin'`,
          {
            replacements: { companyId: company.id }
          }
        );
      }

      console.log("✅ Language data migration completed successfully");
    } catch (error) {
      console.error("❌ Error during language data migration:", error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface) => {
    // Não faz nada no down para preservar dados
    console.log("Language data migration rollback - no action taken to preserve data");
  }
};