import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  DataType,
  Default
} from "sequelize-typescript";
import Company from "./Company";

@Table
class LanguageSettings extends Model<LanguageSettings> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Default(["pt", "en", "es", "ar", "tr"])
  @Column(DataType.JSONB)
  systemLanguages: string[];

  @Default(false)
  @Column
  featureEnabled: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default LanguageSettings;