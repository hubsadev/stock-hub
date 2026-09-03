import type { StockLevel, StockMovement } from "../api";

export function stockAvailableFor(
  stockLevels: StockLevel[],
  articleId: string,
  locationId?: string | null,
) {
  return stockLevels
    .filter(
      (level) =>
        level.article.id === articleId &&
        (!locationId || level.location.id === locationId),
    )
    .reduce((sum, level) => sum + Number(level.quantity ?? 0), 0);
}

export function stockStatusCategory(
  level: StockLevel,
): "rupture" | "sous-seuil" | "disponible" {
  if (level.quantity <= 0) return "rupture";
  if (level.quantity <= level.article.minimumStock) return "sous-seuil";
  return "disponible";
}

export function initialQuantityForLevel(
  level: StockLevel,
  movements: StockMovement[],
) {
  let quantity = Number(level.quantity ?? 0);
  for (const movement of movements) {
    if (
      movement.status === "CANCELLED" ||
      movement.status === "DRAFT" ||
      movement.type === "INITIAL" ||
      movement.type === "ADJUSTMENT" ||
      movement.type === "EXIT_REQUEST"
    )
      continue;
    for (const line of movement.lines) {
      if (line.articleId !== level.article.id) continue;
      const amount = Number(
        line.completedQuantity ??
          line.expectedQuantity ??
          line.requestedQuantity ??
          0,
      );
      if (movement.type === "ENTRY" || movement.type === "RETURN") {
        if (movement.toLocationId === level.location.id) quantity -= amount;
      } else if (movement.type === "EXIT") {
        if (movement.fromLocationId === level.location.id) quantity += amount;
      } else if (movement.type === "TRANSFER") {
        if (movement.toLocationId === level.location.id) quantity -= amount;
        if (movement.fromLocationId === level.location.id) quantity += amount;
      }
    }
  }
  return Math.max(0, quantity);
}

export function stockInitialForLevel(
  level: StockLevel,
  movements: StockMovement[],
) {
  const explicitInitial = Number(level.article.initialStock);
  if (Number.isFinite(explicitInitial) && explicitInitial >= 0) {
    return explicitInitial;
  }

  const relevant = movements
    .filter(
      (movement) =>
        movement.status !== "CANCELLED" &&
        movement.status !== "DRAFT" &&
        movement.lines.some((line) => line.articleId === level.article.id) &&
        (movement.fromLocationId === level.location.id ||
          movement.toLocationId === level.location.id),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  const initialMovement = relevant.find(
    (movement) => movement.type === "INITIAL",
  );
  if (initialMovement) {
    return initialMovement.lines
      .filter((line) => line.articleId === level.article.id)
      .reduce(
        (sum, line) =>
          sum + Number(line.completedQuantity ?? line.expectedQuantity ?? 0),
        0,
      );
  }

  // Compatibilite avec les anciens articles : le premier inventaire conserve
  // le stock theorique d'avant comptage dans expectedQuantity.
  const firstInventory = relevant.find(
    (movement) => movement.type === "ADJUSTMENT",
  );
  const theoretical = firstInventory?.lines.find(
    (line) => line.articleId === level.article.id,
  )?.expectedQuantity;
  if (theoretical !== null && theoretical !== undefined) {
    return Number(theoretical);
  }

  return initialQuantityForLevel(level, movements);
}

export function stockMovementMetrics(
  level: StockLevel,
  movements: StockMovement[],
) {
  let entries = 0;
  let exits = 0;
  for (const movement of movements) {
    if (movement.status === "CANCELLED" || movement.status === "DRAFT")
      continue;
    for (const line of movement.lines) {
      if (line.articleId !== level.article.id) continue;
      const quantity = Number(
        line.completedQuantity ??
          line.expectedQuantity ??
          line.requestedQuantity ??
          0,
      );
      if (quantity <= 0) continue;
      if (
        (movement.type === "ENTRY" || movement.type === "RETURN") &&
        movement.toLocationId === level.location.id
      )
        entries += quantity;
      if (
        movement.type === "EXIT" &&
        movement.fromLocationId === level.location.id
      )
        exits += quantity;
      if (movement.type === "TRANSFER") {
        if (movement.toLocationId === level.location.id) entries += quantity;
        if (movement.fromLocationId === level.location.id) exits += quantity;
      }
    }
  }
  return {
    entries,
    exits,
    // Le stock de depart est immuable : l'inventaire ne le remplace jamais.
    initial: stockInitialForLevel(level, movements),
  };
}

export function stockLastMovementDate(
  level: StockLevel,
  movements: StockMovement[],
  formatDate: (value: string | Date | null | undefined) => string,
): string {
  let latest = "";
  for (const movement of movements) {
    if (movement.status === "CANCELLED" || movement.status === "DRAFT")
      continue;
    const hasArticle = movement.lines.some(
      (l) => l.articleId === level.article.id,
    );
    const hasLocation =
      movement.fromLocationId === level.location.id ||
      movement.toLocationId === level.location.id;
    if (hasArticle && hasLocation) {
      if (!latest || movement.date > latest) latest = movement.date;
    }
  }
  return latest ? formatDate(latest) : "-";
}
