import { prisma } from "@stock-hub/database";

const apply = process.argv.includes("--apply");

function quantityByArticle<T extends { articleId: string; completedQuantity: number | null }>(
  lines: T[],
) {
  const totals = new Map<string, number>();
  for (const line of lines) {
    totals.set(
      line.articleId,
      (totals.get(line.articleId) ?? 0) + Number(line.completedQuantity ?? 0),
    );
  }
  return totals;
}

async function main() {
  const [orphanReturns, exits] = await Promise.all([
    prisma.stockMovement.findMany({
      where: {
        type: "RETURN",
        sourceRequestId: null,
        status: { not: "CANCELLED" },
      },
      include: {
        lines: { include: { article: true } },
      },
      orderBy: { date: "asc" },
    }),
    prisma.stockMovement.findMany({
      where: {
        type: "EXIT",
        status: { not: "CANCELLED" },
      },
      include: {
        lines: { include: { article: true } },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  let repaired = 0;
  let skipped = 0;

  for (const movement of orphanReturns) {
    const returnedByArticle = quantityByArticle(movement.lines);
    const candidates = exits.filter((exit) => {
      if (exit.date > movement.date) return false;
      if (movement.toLocationId && exit.fromLocationId !== movement.toLocationId) {
        return false;
      }
      const exitedByArticle = quantityByArticle(exit.lines);
      return [...returnedByArticle.entries()].every(
        ([articleId, quantity]) =>
          (exitedByArticle.get(articleId) ?? 0) >= quantity,
      );
    });

    if (candidates.length !== 1) {
      skipped += 1;
      console.log(
        [
          "SKIP",
          movement.reference,
          "candidates=" + candidates.length,
          "articles=" +
            movement.lines
              .map((line) => line.article?.code ?? line.articleId)
              .join(","),
        ].join(" "),
      );
      continue;
    }

    const source = candidates[0];
    console.log(
      [
        apply ? "REPAIR" : "DRY-RUN",
        movement.reference,
        "->",
        source.reference,
        "locationId=" + (movement.toLocationId ?? "-"),
      ].join(" "),
    );

    if (!apply) continue;

    const before = movement;
    const after = await prisma.stockMovement.update({
      where: { id: movement.id },
      data: { sourceRequestId: source.id },
      include: {
        lines: { include: { article: true } },
        sourceRequest: { include: { lines: { include: { article: true } } } },
      },
    });
    await prisma.auditLog.create({
      data: {
        action: "REPAIR_ORPHAN_RETURN_SOURCE",
        entity: "StockMovement",
        entityId: movement.id,
        before: before as any,
        after: after as any,
      },
    });
    repaired += 1;
  }

  console.log(
    [
      "Done.",
      "orphans=" + orphanReturns.length,
      "repaired=" + repaired,
      "skipped=" + skipped,
      apply ? "mode=apply" : "mode=dry-run",
    ].join(" "),
  );
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
