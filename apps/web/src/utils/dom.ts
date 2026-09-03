import { formatNumber } from "./format";

export function setVisible(element: Element | null, visible: boolean) {
  if (!element) return;
  element.classList.toggle("active", visible);
  element.classList.toggle("show", visible);
}

export function setText(
  root: HTMLElement,
  selector: string,
  value: number | string,
) {
  const element = root.querySelector<HTMLElement>(selector);
  if (element) element.textContent = formatNumber(value);
}

export function isOnline() {
  return navigator.onLine !== false;
}

export function selectedText(select: HTMLSelectElement | undefined) {
  if (!select?.value) return undefined;
  return select.selectedOptions[0]?.textContent?.trim() || undefined;
}
