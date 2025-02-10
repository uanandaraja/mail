import { useQuery } from "@tanstack/react-query";
import { Mail } from "@/components/mail/data";

interface ApiResponse {
  messages: Mail[];
  error?: string;
}

async function fetchEmails(): Promise<Mail[]> {
  const response = await fetch("/api/v1/mails");
  const data: ApiResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch emails");
  }

  return data.messages;
}

export function useGmail() {
  return useQuery({
    queryKey: ["emails"],
    queryFn: fetchEmails,
  });
}
