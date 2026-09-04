import type { StockUser } from "../../api";

export type LoginContext = {
  loginUser: (body: {
    identifier: string;
    password: string;
  }) => Promise<{ user: StockUser }>;
  getCurrentUser: () => StockUser | null;
  setCurrentUser: (user: StockUser | null) => void;
  getPendingRouteAfterLogin: () => string;
  setPendingRouteAfterLogin: (route: string) => void;
  updateCurrentUserDisplay: (root: HTMLElement) => void;
  applyRoleAccess: (root: HTMLElement) => void;
  canAccessView: (view: string) => boolean;
  navigateToView: (
    root: HTMLElement,
    view: string,
    navButton?: HTMLElement,
    options?: { replace?: boolean; skipHistory?: boolean },
  ) => void;
  viewForRoute: (route: string) => string | null;
  writeLoginRoute: (replace?: boolean) => void;
  DEFAULT_ROUTE: string;
};

export function readStoredUserPage(): StockUser | null {
  const raw = localStorage.getItem("stock-hub.user");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StockUser;
    return parsed?.identifier || parsed?.email ? parsed : null;
  } catch {
    return null;
  }
}

export function setLoginErrorPage(
  root: HTMLElement,
  message: string | null,
) {
  const error = root.querySelector<HTMLElement>("#loginError");
  if (!error) return;
  error.textContent = message ?? "";
  error.classList.toggle("hidden", !message);
}

export function showLoginPage(root: HTMLElement) {
  const overlay = root.querySelector<HTMLElement>("#loginOverlay");
  if (overlay) overlay.style.display = "flex";
}

export function hideLoginPage(root: HTMLElement) {
  const overlay = root.querySelector<HTMLElement>("#loginOverlay");
  if (overlay) overlay.style.display = "none";
}

export function togglePasswordPage(root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>("#loginPassword");
  if (!input) return;
  input.type = input.type === "password" ? "text" : "password";
}

export async function loginPage(root: HTMLElement, ctx: LoginContext) {
  const identifier =
    root
      .querySelector<HTMLInputElement>("#loginIdentifier")
      ?.value.trim()
      .toLowerCase() ?? "";
  const password =
    root.querySelector<HTMLInputElement>("#loginPassword")?.value ?? "";
  setLoginErrorPage(root, null);
  try {
    const { user } = await ctx.loginUser({ identifier, password });
    ctx.setCurrentUser(user);
    localStorage.setItem("stock-hub.session", "1");
    localStorage.setItem("stock-hub.user", JSON.stringify(user));
    hideLoginPage(root);
    ctx.updateCurrentUserDisplay(root);
    ctx.applyRoleAccess(root);
    const requestedView =
      ctx.viewForRoute(ctx.getPendingRouteAfterLogin()) ?? "home";
    ctx.navigateToView(
      root,
      ctx.canAccessView(requestedView) ? requestedView : "home",
      undefined,
      { replace: true },
    );
    ctx.setPendingRouteAfterLogin(ctx.DEFAULT_ROUTE);
  } catch (error) {
    setLoginErrorPage(
      root,
      error instanceof Error ? error.message : "Connexion impossible.",
    );
  }
}

export function logoutPage(root: HTMLElement, ctx: LoginContext) {
  ctx.setCurrentUser(null);
  localStorage.removeItem("stock-hub.session");
  localStorage.removeItem("stock-hub.user");
  ctx.updateCurrentUserDisplay(root);
  showLoginPage(root);
  ctx.writeLoginRoute(true);
}
