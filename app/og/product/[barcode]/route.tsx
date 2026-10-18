import { getProduct } from "@/lib/catalog";
import { productCard } from "../../_card";

export const revalidate = 3600;

export async function GET(_req: Request, { params }: { params: Promise<{ barcode: string }> }) {
  const p = await getProduct((await params).barcode);
  if (!p) return new Response("Not found", { status: 404 });
  return productCard(p);
}
