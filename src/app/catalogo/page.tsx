import { getAllPatterns } from "@/content";
import CatalogPageClient from "./CatalogPageClient";

export default function CatalogoPage() {
  const patterns = getAllPatterns();
  return <CatalogPageClient patterns={patterns} />;
}
