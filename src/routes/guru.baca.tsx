import { createFileRoute } from "@tanstack/react-router";
import { EbookLibrary } from "@/components/sibudi/ebook-library";

export const Route = createFileRoute("/guru/baca")({
  ssr: false,
  component: () => <EbookLibrary desc="Kumpulan buku digital sekolah untuk dibaca guru." />,
});
