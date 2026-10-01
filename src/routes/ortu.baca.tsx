import { createFileRoute } from "@tanstack/react-router";
import { EbookLibrary } from "@/components/sibudi/ebook-library";

export const Route = createFileRoute("/ortu/baca")({
  ssr: false,
  component: () => <EbookLibrary desc="Kumpulan buku digital untuk dibaca bersama ananda." />,
});
