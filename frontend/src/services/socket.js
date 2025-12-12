import { isObject } from "lodash";
import SocketWorker from "./SocketWorker";
import api from "../services/api"; // per prendere il token

export function socketConnection(params) {
  if (socketInstance) return socketInstance;

  let userId = params?.user?.id || "";
  let companyId = params?.user?.companyId || "";

  socketInstance = SocketWorker(companyId, userId);
  return socketInstance;
}