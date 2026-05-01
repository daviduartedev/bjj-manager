/** Nome público do produto (NEXT_PUBLIC_APP_NAME no `.env.local`). */
export const APP_NAME =
  typeof process.env.NEXT_PUBLIC_APP_NAME === "string" &&
  process.env.NEXT_PUBLIC_APP_NAME.trim().length > 0
    ? process.env.NEXT_PUBLIC_APP_NAME.trim()
    : "Casca";
