import { Chat, Contact } from "@whiskeysockets/baileys";
import Baileys from "../../models/Baileys";

interface Request {
  whatsappId: number;
  contacts?: Contact[];
  chats?: Chat[];
}

const createOrUpdateBaileysService = async ({
  whatsappId,
  contacts,
  chats,
}: Request): Promise<Baileys> => {

  try {
    const baileysExists = await Baileys.findOne({
      where: { whatsappId }
    });

    if (baileysExists) {
      const parseMaybeJson = <T>(value: unknown, fallback: T): T => {
        if (!value) return fallback;
        if (typeof value === "string") {
          try {
            return JSON.parse(value) as T;
          } catch {
            return fallback;
          }
        }
        if (Array.isArray(value)) return value as T;
        return fallback;
      };

      const getChats = parseMaybeJson<Chat[]>(baileysExists.chats, []);
      const getContacts = parseMaybeJson<Contact[]>(baileysExists.contacts, []);

      if (chats) {
        getChats.push(...chats);
        getChats.sort();
        const newChats = getChats.filter((v: Chat, i: number, a: Chat[]) => a.findIndex(v2 => (v2.id === v.id)) === i)

        return await baileysExists.update({
          chats: JSON.stringify(newChats),
        });
      }

      if (contacts) {
        getContacts.push(...contacts);
        getContacts.sort();
        const newContacts = getContacts.filter((v: Contact, i: number, a: Contact[]) => a.findIndex(v2 => (v2.id === v.id)) === i)

        return await baileysExists.update({
          contacts: JSON.stringify(newContacts),
        });
      }

    }

    const baileys = await Baileys.create({
      whatsappId,
      contacts: JSON.stringify(contacts),
      chats: JSON.stringify(chats)
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    return baileys;
  } catch (error) {
    console.log(error, whatsappId, contacts);
    throw error;
  }
};

export default createOrUpdateBaileysService;
