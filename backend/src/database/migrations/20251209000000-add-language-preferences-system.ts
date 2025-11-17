import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Adicionar campo de línguas habilitadas na tabela de empresas
    await queryInterface.addColumn("Companies", "enabledLanguages", {
      type: DataTypes.JSONB,
      defaultValue: ["pt", "en", "es", "ar", "tr"], // Todas as 5 línguas disponíveis por padrão
      allowNull: false
    });

    // Adicionar campo de línguas selecionadas para usuários admin
    await queryInterface.addColumn("Users", "adminSelectedLanguages", {
      type: DataTypes.JSONB,
      allowNull: true, // Null significa que herda do super admin
      defaultValue: null
    });

    // Adicionar campo de idioma preferido do usuário
    await queryInterface.addColumn("Users", "preferredLanguage", {
      type: DataTypes.STRING,
      defaultValue: "pt",
      allowNull: false
    });

    // Adicionar campo de línguas disponíveis (computed field será tratado no modelo)
    await queryInterface.addColumn("Users", "availableLanguages", {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null
    });

    // Criar tabela de configurações globais de idiomas
    await queryInterface.createTable("LanguageSettings", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Companies",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
        unique: true
      },
      systemLanguages: {
        type: DataTypes.JSONB,
        defaultValue: ["pt", "en", "es", "ar", "tr"],
        allowNull: false
      },
      featureEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Feature flag para ativar/desativar novo sistema
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // Criar índices para performance
    await queryInterface.addIndex("LanguageSettings", ["companyId"]);
    await queryInterface.addIndex("Users", ["preferredLanguage"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Companies", "enabledLanguages");
    await queryInterface.removeColumn("Users", "adminSelectedLanguages");
    await queryInterface.removeColumn("Users", "preferredLanguage");
    await queryInterface.removeColumn("Users", "availableLanguages");
    await queryInterface.dropTable("LanguageSettings");
  }
};