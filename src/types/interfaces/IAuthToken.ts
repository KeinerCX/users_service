import { Flag } from "../Flags";

export interface IAuthToken {
  user_id: string;
  client_ip: string;
  expires: Date;
  flags: Flag[];
}
