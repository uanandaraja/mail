"use server";

import { account } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { google } from "googleapis";
import { db } from "@/db";

export async function createGmailClient(userId: string) {
  // Get the user's OAuth tokens from the database
  const userAccount = await db.query.account.findFirst({
    where: and(eq(account.userId, userId), eq(account.providerId, "google")),
  });

  if (!userAccount) {
    throw new Error("No Google account found");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  oauth2Client.setCredentials({
    access_token: userAccount.accessToken || undefined,
    refresh_token: userAccount.refreshToken || undefined,
    expiry_date: userAccount.accessTokenExpiresAt?.getTime(),
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}
