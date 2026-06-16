import { nanoid } from "nanoid";

export function generateManageKey(): string {
  return nanoid(21);
}
