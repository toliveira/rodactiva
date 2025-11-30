import { useEffect, useState } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useLocation } from "wouter";

export default function SearchCommand() {
    const [open, setOpen] = useState(false);
    const [, setLocation] = useLocation();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2 text-muted-foreground"
                onClick={() => setOpen(true)}
            >
                <Search className="h-4 w-4 xl:mr-2" />
                <span className="hidden xl:inline-flex">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Links">
                        <CommandItem onSelect={() => runCommand(() => setLocation("/"))}>
                            Home
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setLocation("/about"))}>
                            About
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setLocation("/activities"))}>
                            Events
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setLocation("/routes"))}>
                            Routes
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setLocation("/gallery"))}>
                            Gallery
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setLocation("/members"))}>
                            Members
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setLocation("/contact"))}>
                            Contact
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setLocation("/private"))}>
                            Private Area
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setLocation("/registration"))}>
                            Registration
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
