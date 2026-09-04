import type { StockMovement } from "../api";

export function movementTypeLabel(type: StockMovement["type"]) {
  const labels: Record<StockMovement["type"], string> = {
    ENTRY: "Entree",
    EXIT_REQUEST: "Demande de sortie",
    EXIT: "Sortie",
    RETURN: "Retour",
    TRANSFER: "Transfert",
    ADJUSTMENT: "Inventaire",
    INITIAL: "Stock de depart",
  };
  return labels[type] ?? type;
}

export function movementQuantity(movement: StockMovement) {
  const multiplier =
    movement.type === "EXIT" ||
    movement.type === "EXIT_REQUEST" ||
    movement.type === "TRANSFER"
      ? -1
      : 1;
  const total = movement.lines.reduce(
    (sum, line) =>
      sum +
      Number(
        line.completedQuantity ??
          line.requestedQuantity ??
          line.expectedQuantity ??
          0,
      ),
    0,
  );
  return total * multiplier;
}

export function movementActor(movement: StockMovement) {
  return (
    movement.handledBy ??
    movement.receivedBy ??
    movement.deliveredBy ??
    movement.requestedBy ??
    "-"
  );
}

export function movementArticleLabel(movement: StockMovement) {
  if (movement.lines.length > 1) return movement.lines.length + " articles";
  const first = movement.lines[0];
  if (!first?.article) return "-";
  return first.article.designation + " (" + first.article.code + ")";
}

export function movementStatusLabel(movement: StockMovement) {
  if (movement.type === "EXIT") return "Sortie reelle";
  if (movement.status === "SUBMITTED") return "Demandee";
  if (movement.status === "PREPARED") return "Preparee";
  if (movement.status === "COMPLETED") return "Terminee";
  if (movement.status === "REJECTED") return "Refusee";
  if (movement.status === "CANCELLED") return "Annulee";
  return movement.status;
}

export function movementTextKey(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function movementDateKey(value: string | null | undefined) {
  return (value ?? "").slice(0, 10);
}

export function movementProjectKey(movement: StockMovement) {
  return (
    movement.projectId ??
    movementTextKey(movement.project?.code ?? movement.project?.name)
  );
}

export function movementPersonKey(movement: StockMovement) {
  return movementTextKey(
    movement.receivedBy ?? movement.requestedBy ?? movement.handledBy,
  );
}

export function movementArticleKeys(movement: StockMovement) {
  return new Set(
    movement.lines
      .map(
        (line) =>
          line.articleId ||
          line.article?.id ||
          line.article?.code ||
          line.article?.designation ||
          "",
      )
      .filter(Boolean),
  );
}

export function movementRequestedTotal(movement: StockMovement) {
  return movement.lines.reduce(
    (sum, line) => sum + Number(line.requestedQuantity ?? 0),
    0,
  );
}

export function movementCompletedTotal(movement: StockMovement) {
  return movement.lines.reduce(
    (sum, line) => sum + Number(line.completedQuantity ?? 0),
    0,
  );
}

export function hasCommonArticle(left: StockMovement, right: StockMovement) {
  const leftKeys = movementArticleKeys(left);
  const rightKeys = movementArticleKeys(right);
  return [...leftKeys].some((key) => rightKeys.has(key));
}

export function looksLikeGeneratedExit(
  request: StockMovement,
  exit: StockMovement,
) {
  if (request.type !== "EXIT_REQUEST" || exit.type !== "EXIT") return false;
  if (
    exit.sourceRequestId === request.id ||
    request.generatedExits?.some((item) => item.id === exit.id)
  )
    return true;

  const requestProject = movementProjectKey(request);
  const exitProject = movementProjectKey(exit);
  const requestPerson = movementPersonKey(request);
  const exitPerson = movementPersonKey(exit);
  const requestedTotal = movementRequestedTotal(request);
  const completedTotal = movementCompletedTotal(exit);

  return Boolean(
    requestProject &&
    exitProject &&
    requestProject === exitProject &&
    (!requestPerson || !exitPerson || requestPerson === exitPerson) &&
    movementDateKey(request.date) === movementDateKey(exit.date) &&
    hasCommonArticle(request, exit) &&
    completedTotal > 0 &&
    (!requestedTotal || requestedTotal >= completedTotal),
  );
}

export function linkedExitForRequestFromMovements(
  movement: StockMovement,
  movements: StockMovement[],
) {
  if (movement.type !== "EXIT_REQUEST") return null;
  return (
    movements.find(
      (item) => item.type === "EXIT" && looksLikeGeneratedExit(movement, item),
    ) ??
    movement.generatedExits?.[0] ??
    null
  );
}

export function requestForExitFromMovements(
  movement: StockMovement,
  movements: StockMovement[],
) {
  if (movement.type !== "EXIT") return null;
  return (
    movements.find(
      (item) =>
        item.type === "EXIT_REQUEST" && looksLikeGeneratedExit(item, movement),
    ) ??
    movement.sourceRequest ??
    null
  );
}
