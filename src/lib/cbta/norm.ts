/** NFC, lower-case, drop zero-width joiners so Bangla typed on any keyboard still matches. */
export function norm(s: string): string {
  return s.normalize("NFC").toLowerCase().replace(/[​-‍﻿]/g, "").replace(/\s+/g, " ").trim();
}
