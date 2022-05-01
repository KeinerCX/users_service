import { Flag } from "../Flags";

export interface Meta {
  auth: {
    userFlags?: Flag[];
    verifyIP?: boolean;
  };
}
