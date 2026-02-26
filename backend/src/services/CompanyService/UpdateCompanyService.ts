import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import Setting from "../../models/Setting";
import User from "../../models/User";

interface CompanyData {
  name: string;
  id?: number | string;
  phone?: string;
  email?: string;
  status?: boolean;
  planId?: number;
  campaignsEnabled?: boolean;
  dueDate?: string;
  recurrence?: string;
  document?: string;
  paymentMethod?: string;
  password?: string;
  generateInvoice?: boolean;
  currency?: string;
}

const UpdateCompanyService = async (
  companyData: CompanyData
): Promise<Company> => {

  const company = await Company.findByPk(companyData.id);
  const {
    name,
    phone,
    email,
    status,
    planId,
    campaignsEnabled,
    dueDate,
    recurrence,
    document,
    paymentMethod,
    password,
    generateInvoice,
    currency
  } = companyData;

  if (!company) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  const nextEmail = email && email.trim() !== "" ? email.trim() : company.email;

  const existUser = nextEmail
    ? await User.findOne({
        where: {
          companyId: company.id,
          email: nextEmail
        }
      })
    : null;

  const user = await User.findOne({
    where: {
      companyId: company.id,
      email: company.email
    }
  });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404)
  }
  
  if (existUser && existUser.id !== user.id) {
    throw new AppError("ERR_USER_EMAIL_EXISTS", 404)
  }

  const userUpdateData: { email?: string; password?: string } = {};
  if (nextEmail) {
    userUpdateData.email = nextEmail;
  }
  if (password && password.trim() !== "") {
    userUpdateData.password = password;
  }
  if (Object.keys(userUpdateData).length) {
    await user.update(userUpdateData);
  }

  await company.update({
    name,
    phone,
    email: nextEmail,
    status,
    planId,
    dueDate,
    recurrence,
    document,
    paymentMethod,
    generateInvoice,
    currency
  });

  if (companyData.campaignsEnabled !== undefined) {
    const [setting, created] = await Setting.findOrCreate({
      where: {
        companyId: company.id,
        key: "campaignsEnabled"
      },
      defaults: {
        companyId: company.id,
        key: "campaignsEnabled",
        value: `${campaignsEnabled}`
      }
    });
    if (!created) {
      await setting.update({ value: `${campaignsEnabled}` });
    }
  }

  return company;
};

export default UpdateCompanyService;
