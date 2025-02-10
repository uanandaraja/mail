import { createGmailClient } from "@/lib/gmail";
import { Mail } from "@/components/mail/data";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // WE CAN MAKE THIS WHOLE THING BETTER, NOW JUST WANT TO MAKE THIS THING WORKS

  try {
    const gmail = await createGmailClient(session.user.id);

    // First get the list of messages
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    });

    // Then fetch full details for each message in parallel
    const messages = await Promise.all(
      response.data.messages?.map(async (message) => {
        const fullMessage = await gmail.users.messages.get({
          userId: "me",
          id: message.id!,
          format: "full",
        });

        // Parse the email data
        const headers = fullMessage.data.payload?.headers;
        const subject = headers?.find((h) => h.name === "Subject")?.value || "No Subject";
        const from = headers?.find((h) => h.name === "From")?.value || "";
        const date = headers?.find((h) => h.name === "Date")?.value || new Date().toISOString();

        // Get email body
        const parts = fullMessage.data.payload?.parts || [];
        let body = fullMessage.data.payload?.body?.data || "";

        // If the message is multipart, find the text part
        if (parts.length > 0) {
          const textPart = parts.find((part) => part.mimeType === "text/plain");
          if (textPart && textPart.body?.data) {
            body = textPart.body.data;
          }
        }

        // Decode the body from base64
        const decodedBody = body
          ? decodeURIComponent(escape(atob(body.replace(/-/g, "+").replace(/_/g, "/"))))
          : "";

        // Parse the from field to extract name and email
        const fromMatch = from.match(/(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)/);
        const name = fromMatch?.[1] || from.split("@")[0];
        const email = fromMatch?.[2] || from;

        // Extract labels from Gmail labels
        const labels: string[] = ["inbox"];
        if (fullMessage.data.labelIds) {
          if (fullMessage.data.labelIds.includes("IMPORTANT")) labels.push("important");
          if (fullMessage.data.labelIds.includes("CATEGORY_PERSONAL")) labels.push("personal");
          if (fullMessage.data.labelIds.includes("CATEGORY_SOCIAL")) labels.push("social");
          if (fullMessage.data.labelIds.includes("CATEGORY_UPDATES")) labels.push("updates");
          if (fullMessage.data.labelIds.includes("CATEGORY_FORUMS")) labels.push("forums");
          if (fullMessage.data.labelIds.includes("CATEGORY_PROMOTIONS")) labels.push("promotions");
        }

        return {
          id: fullMessage.data.id!,
          name,
          email,
          subject,
          text: decodedBody || fullMessage.data.snippet || "",
          date,
          read: !fullMessage.data.labelIds?.includes("UNREAD"),
          labels,
          muted: fullMessage.data.labelIds?.includes("MUTED") || false,
        } satisfies Mail;
      }) || [],
    );

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Gmail API error:", error);
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}
