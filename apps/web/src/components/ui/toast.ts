export function showToast(
  root: HTMLElement,
  message: string,
  tone: "success" | "error" = "success",
) {
  root.querySelector("#stockHubToast")?.remove();
  const toast = document.createElement("div");
  toast.id = "stockHubToast";
  toast.className =
    "fixed top-5 right-5 z-[80] max-w-md rounded-xl border px-4 py-3 shadow-xl text-sm font-semibold " +
    (tone === "success"
      ? "bg-success-50 border-success-100 text-success-700"
      : "bg-error-50 border-error-100 text-error-700");
  toast.textContent = message;
  root.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3500);
}
