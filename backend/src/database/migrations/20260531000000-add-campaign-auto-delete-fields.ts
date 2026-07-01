import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Campaigns", "autoDeleteMessages", {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    await queryInterface.addColumn("Campaigns", "autoDeleteDelayMinutes", {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      allowNull: false
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Campaigns", "autoDeleteDelayMinutes");
    await queryInterface.removeColumn("Campaigns", "autoDeleteMessages");
  }
};
