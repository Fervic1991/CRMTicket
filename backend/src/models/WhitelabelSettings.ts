import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  DataType,
  Default,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  BeforeCreate,
  BeforeUpdate
} from "sequelize-typescript";
import { Op } from "sequelize";
import User from "./User";
import Company from "./Company";

@Table({
  tableName: "WhitelabelSettings",
  indexes: [
    {
      unique: true,
      fields: ["isGlobal"],
      where: { isGlobal: true },
      name: "unique_global_whitelabel"
    },
    {
      unique: true,
      fields: ["companyId"],
      where: { companyId: { [Op.ne]: null } },
      name: "unique_company_whitelabel"
    }
  ]
})
class WhitelabelSettings extends Model<WhitelabelSettings> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Company)
  @AllowNull(true)
  @Column
  companyId: number | null;

  @BelongsTo(() => Company)
  company: Company;

  @AllowNull(true)
  @Column(DataType.STRING(500))
  logoLightUrl: string | null;

  @AllowNull(true)
  @Column(DataType.STRING(500))
  logoDarkUrl: string | null;

  @Default(false)
  @AllowNull(false)
  @Column
  isGlobal: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BeforeCreate
  @BeforeUpdate
  static async validateOnlyOneGlobal(instance: WhitelabelSettings) {
    if (instance.isGlobal === true) {
      const existingGlobal = await WhitelabelSettings.findOne({
        where: { isGlobal: true }
      });
      
      if (existingGlobal && (!instance.id || existingGlobal.id !== instance.id)) {
        throw new Error("Apenas uma configuração global de whitelabel é permitida");
      }
    }
  }

  @BeforeCreate
  @BeforeUpdate
  static validateCompanyOrGlobal(instance: WhitelabelSettings) {
    if (instance.isGlobal && instance.companyId) {
      throw new Error("Configuração global não pode ter empresa associada");
    }
    
    if (!instance.isGlobal && !instance.companyId) {
      throw new Error("Configuração não-global deve ter empresa associada");
    }
  }
}

export default WhitelabelSettings;