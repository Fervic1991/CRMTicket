import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { sanitizeNumber } from "../utils/sanitizers";
import GetContactService from "../services/ContactServices/GetContactService"; // o un servizio di lista
import AppError from "../errors/AppError";

export const exportSelectedContacts = async (req: Request, res: Response): Promise<Response> => {
  const { contactIds } = req.body; // array di id
  const { companyId } = req.user;

  if (!Array.isArray(contactIds) || contactIds.length === 0) {
    throw new AppError("Nessun contatto selezionato", 400);
  }

  // Sanitizza gli ID
  const sanitizedIds = contactIds.map(id => sanitizeNumber(id)).filter(id => id > 0);

  if (sanitizedIds.length === 0) {
    throw new AppError("Nessun contatto valido selezionato", 400);
  }

  // Recupera i contatti
  const contacts = [];
  for (const id of sanitizedIds) {
    const contact = await GetContactService({ id, companyId });
    if (contact) contacts.push(contact);
  }

  if (contacts.length === 0) {
    throw new AppError("Contatti non trovati", 404);
  }

  // Qui puoi decidere il formato: CSV, JSON, Excel...
  // Per esempio JSON semplice:
  return res.status(200).json({ contacts });
};
