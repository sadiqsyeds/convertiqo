import { getToolPage } from "@/lib/seo";
import { renderToolOgImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = "image/png";

const page = getToolPage("pdf-to-word")!;
export const alt = page.ogTitle;

export default function OgImage() {
  return renderToolOgImage({
    slug: "pdf-to-word",
    ogTitle: page.ogTitle,
    ogDescription: page.ogDescription,
  });
}
