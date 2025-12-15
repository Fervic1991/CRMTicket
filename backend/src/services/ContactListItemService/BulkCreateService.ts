import ContactListItem from "../../models/ContactListItem";
import Contact from "../../models/Contact";
import CheckContactNumber from "../WbotServices/CheckNumber";
import logger from "../../utils/logger";

interface BulkData {
  contactListId: number;
  contactIds: number[];
  companyId: number;
}

const BulkCreateService = async (data: BulkData): Promise<ContactListItem[]> => {
  const { contactListId, contactIds, companyId } = data;

  // Fetch contacts by IDs (assicurati che appartengono alla stessa azienda)
  const contacts = await Contact.findAll({
    where: {
      id: contactIds,
      companyId
    }
  });

  if (contacts.length === 0) {
    throw new Error("No contacts found with provided IDs");
  }

  const createdItems: ContactListItem[] = [];

  // Crea un ContactListItem per ogni contatto
  for (const contact of contacts) {
    try {
      const [record] = await ContactListItem.findOrCreate({
        where: {
          number: contact.number,
          companyId,
          contactListId
        },
        defaults: {
          name: contact.name,
          number: contact.number,
          email: contact.email || null,
          companyId,
          contactListId
        }
      });

      // Verifica numero WhatsApp
      try {
        const response: any = await CheckContactNumber(record.number, record.companyId);
        if (response) {
          record.isWhatsappValid = true;
          record.number = response.jid.split("@")[0];
        } else {
          record.isWhatsappValid = false;
        }
        await record.save();
      } catch (whatsappError) {
        logger.warn(`Could not validate WhatsApp number: ${record.number}`);
      }

      createdItems.push(record);
    } catch (err: any) {
      logger.error(`Error creating contact list item for contact ${contact.id}: ${err.message}`);
      // continua con il prossimo contatto
    }
  }

  return createdItems;
};

export default BulkCreateService;