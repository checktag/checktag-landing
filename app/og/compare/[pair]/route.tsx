import { getProduct } from "@/lib/catalog";
import { compareCard } from "../../_card";

export const revalidate = 3600;

export async function GET(_req: Request, { params }: { params: Promise<{ pair: string }> }) {
  const m = /^(\d{8,14})-vs-(\d{8,14})$/.exec((await params).pair);
  if (!m) return new Response("Not found", { status: 404 });
  const [a, b] = await Promise.all([getProduct(m[1]), getProduct(m[2])]);
  if (!a || !b) return new Response("Not found", { status: 404 });
  return compareCard(a, b);
}
