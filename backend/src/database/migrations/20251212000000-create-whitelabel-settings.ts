import { QueryInterface, DataTypes, Op } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("WhitelabelSettings", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Companies",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      logoLightUrl: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      logoDarkUrl: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      isGlobal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Índice único para garantir apenas uma configuração global
    await queryInterface.addIndex("WhitelabelSettings", ["isGlobal"], {
      unique: true,
      where: { isGlobal: true },
      name: "unique_global_whitelabel"
    });

    // Índice único para garantir uma configuração por empresa
    await queryInterface.addIndex("WhitelabelSettings", ["companyId"], {
      unique: true,
      where: { companyId: { [Op.ne]: null } },
      name: "unique_company_whitelabel"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("WhitelabelSettings");
  }
};