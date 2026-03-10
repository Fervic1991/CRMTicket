import { Request, Response } from "express";
import ImportContactsService from "../services/WbotServices/ImportContactsService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const whatsappId = req.body?.whatsappId ? Number(req.body.whatsappId) : undefined;

  await ImportContactsService(companyId, whatsappId);

  return res.status(200).json({ message: "contacts imported" });
};
