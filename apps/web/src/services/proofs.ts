import type { StockMovement } from "../api";

export type ProofStatus = "jointe" | "manquante" | "non-requise";

export function proofRequestForMovement(
  movement: StockMovement,
  requestForExit: (movement: StockMovement) => StockMovement | null | undefined,
) {
  return movement.type === "EXIT_REQUEST" ? movement : requestForExit(movement);
}

export function movementProofSource(
  movement: StockMovement,
  proofRequest: StockMovement | null | undefined,
) {
  if (movement.type === "ENTRY" || movement.type === "EXIT_REQUEST") {
    return movement;
  }
  if (movement.type === "EXIT") {
    if (proofRequest?.proofFileKey || proofRequest?.proofFileName)
      return proofRequest;
    return movement;
  }
  return movement.proofFileKey || movement.proofFileName ? movement : null;
}

export function movementProofCount(
  movement: StockMovement,
  proofRequest: StockMovement | null | undefined,
) {
  const proofSource = movementProofSource(movement, proofRequest);
  return proofSource?.proofFileKey || proofSource?.proofFileName ? 1 : 0;
}

export function movementHasProof(
  movement: StockMovement,
  proofRequest: StockMovement | null | undefined,
) {
  return movementProofCount(movement, proofRequest) > 0;
}

export function movementRequiresSignedProof(
  movement: StockMovement,
  linkedExit: StockMovement | null | undefined,
) {
  if (
    movement.type === "ENTRY" ||
    movement.type === "EXIT" ||
    movement.type === "RETURN" ||
    movement.type === "TRANSFER"
  )
    return true;
  if (movement.type === "EXIT_REQUEST") {
    return (
      movement.status !== "SUBMITTED" &&
      movement.status !== "DRAFT" &&
      !linkedExit
    );
  }
  return false;
}

export function movementProofStatus(
  movement: StockMovement,
  linkedExit: StockMovement | null | undefined,
  proofRequest: StockMovement | null | undefined,
): ProofStatus {
  if (movementHasProof(movement, proofRequest)) return "jointe";
  if (movementRequiresSignedProof(movement, linkedExit)) return "manquante";
  return "non-requise";
}

export function canUploadSignedProofFor(
  movement: StockMovement,
  requestForExit: (movement: StockMovement) => StockMovement | null | undefined,
  linkedExitForRequest: (
    movement: StockMovement,
  ) => StockMovement | null | undefined,
) {
  const proofSource = proofRequestForMovement(movement, requestForExit);
  const linkedExit = proofSource ? linkedExitForRequest(proofSource) : null;
  const preparedEnough =
    proofSource?.status !== "SUBMITTED" || Boolean(linkedExit);
  return Boolean(
    proofSource?.type === "EXIT_REQUEST" &&
    preparedEnough &&
    proofSource.status !== "REJECTED" &&
    proofSource.status !== "CANCELLED" &&
    !proofSource.proofFileName,
  );
}
