import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlignVerticalSpaceAround, ListFilter, SquarePen } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SidebarToggle } from "../ui/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { SearchBar } from "./search-bar";
import { ComposeButton } from "./mail";

export function MailSkeleton() {
  return (
    <div className="flex h-full w-full flex-col">
      {/* Real header with actions */}
      <div className="sticky top-0 z-10 rounded-t-md bg-background pt-[6px]">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-1">
            <SidebarToggle className="h-fit px-2" />
            <ComposeButton />
          </div>
          <SearchBar />
          <div className="flex items-center space-x-1.5">
            <Button variant="ghost" className="md:h-fit md:px-2">
              <AlignVerticalSpaceAround />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="md:h-fit md:px-2">
                  <ListFilter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>All mail</DropdownMenuItem>
                <DropdownMenuItem>Unread</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Separator className="mt-2" />
      </div>

      {/* Skeleton mail list */}
      <div className="h-[calc(93vh)]">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 border-b px-4 py-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
