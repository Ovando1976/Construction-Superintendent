// models/Trade.js

module.exports = (sequelize, DataTypes) => {
  const Trade = sequelize.define("Trade", {
    name: {
      // e.g. "Carpenter", "Plumber", "Welder"
      type: DataTypes.STRING,
      allowNull: false,
    },
    industry: {
      // e.g. "construction", "mechanics", "engineering", "mechanical", "architectural_design"
      type: DataTypes.ENUM(
        "construction",
        "mechanics",
        "engineering",
        "mechanical",
        "architectural_design"
      ),
      allowNull: false,
      defaultValue: "construction",
    },
  }, {
    tableName: "trades", // Or rely on default pluralization
    timestamps: true,     // If you want createdAt/updatedAt fields
  });

  Trade.associate = (models) => {
    // One trade can have many users referencing 'tradeId'
    Trade.hasMany(models.User, {
      foreignKey: "tradeId",
      as: "workers",
    });
  };

  return Trade;
};