import { isObject } from "lodash";
import SocketWorker from "./SocketWorker";
import api from "../services/api"; // per prendere il token

export function socketConnection(params) {
  if (!isObject(params)) return null;

  const companyId = params?.user?.companyId;
  const userId = params?.user?.id;
  const token = api.defaults.headers.Authorization; // prendi il token attuale

  if (!companyId || !userId || !token) return null;

  return SocketWorker(companyId, userId, token);
}
