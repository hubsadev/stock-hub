import type { StockUser } from "../../api";

type BadgeTone = "success" | "warning" | "error" | "gray" | "accent";

export type UtilisateursRolesContext = {
  latestUsers: StockUser[];
  setLatestUsers: (users: StockUser[]) => void;
  currentUser: StockUser | null;
  createUser: (payload: {
    identifier: string;
    email: string | null;
    firstName: string;
    lastName: string;
    roles: string[];
    password?: string;
    active: boolean;
  }) => Promise<StockUser>;
  updateUser: (
    id: string,
    payload: {
      identifier: string;
      email: string | null;
      firstName: string;
      lastName: string;
      roles: string[];
      password?: string;
      active: boolean;
    },
  ) => Promise<StockUser>;
  getUsers: () => Promise<StockUser[]>;
  badge: (label: string, tone?: BadgeTone) => string;
  emptyRow: (colspan: number, message: string) => string;
  setText: (root: HTMLElement, selector: string, value: number | string) => void;
  showToast: (
    root: HTMLElement,
    message: string,
    tone?: "success" | "error",
  ) => void;
  openModal: (root: HTMLElement, id: string) => void;
  closeModal: (root: HTMLElement, id: string) => void;
  updateApiBackedViews: (root: HTMLElement) => void;
  escapeHtml: (value: string | number | null | undefined) => string;
  userIdentity: (user: Pick<StockUser, "identifier" | "email">) => string;
  userDisplayName: (
    user: Pick<StockUser, "firstName" | "lastName" | "identifier" | "email">,
  ) => string;
  roleLabel: (role: string) => string;
  accessLabel: (roles: string[]) => string;
};

let selectedUserId: string | null = null;

function userRow(user: StockUser, ctx: UtilisateursRolesContext) {
  const fullName = ctx.userDisplayName(user);
  const role = user.roles[0] ?? "GESTIONNAIRE_STOCK";
  const identity = ctx.userIdentity(user);
  const contact = user.email ?? "Email non renseigne";
  return `<tr><td class="px-5 py-4"><div class="font-bold">${ctx.escapeHtml(fullName)}</div><div class="text-xs text-gray-500">${ctx.escapeHtml(user.roles.map(ctx.roleLabel).join(", "))}</div></td><td class="px-5 py-4"><div class="font-semibold">${ctx.escapeHtml(identity)}</div><div class="text-xs text-gray-500">${ctx.escapeHtml(contact)}</div></td><td class="px-5 py-4">${ctx.badge(ctx.roleLabel(role), role === "ADMIN_STOCK" ? "accent" : role === "AUDIT" ? "warning" : "success")}</td><td class="px-5 py-4">${ctx.escapeHtml(ctx.accessLabel(user.roles))}</td><td class="px-5 py-4">${ctx.badge(user.active ? "Actif" : "Inactif", user.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right"><button data-action="openUserDetail('${ctx.escapeHtml(user.id)}')" title="Voir utilisateur" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-accent-600"><i data-lucide="eye" class="w-4 h-4"></i></button></td></tr>`;
}

export function renderUsersListPage(
  root: HTMLElement,
  ctx: UtilisateursRolesContext,
) {
  const usersBody = root.querySelector<HTMLElement>("#users tbody");
  if (usersBody)
    usersBody.innerHTML = ctx.latestUsers.length
      ? ctx.latestUsers.map((user) => userRow(user, ctx)).join("")
      : ctx.emptyRow(6, "Aucun utilisateur en base pour le moment.");
  ctx.setText(
    root,
    "#usersAdminCount",
    ctx.latestUsers.filter((user) => user.roles.includes("ADMIN_STOCK")).length,
  );
  ctx.setText(
    root,
    "#usersManagersCount",
    ctx.latestUsers.filter((user) =>
      user.roles.includes("GESTIONNAIRE_STOCK"),
    ).length,
  );
  ctx.setText(
    root,
    "#usersAuditCount",
    ctx.latestUsers.filter((user) => user.roles.includes("AUDIT")).length,
  );
  ctx.setText(
    root,
    "#usersProjectManagersCount",
    ctx.latestUsers.filter((user) => user.roles.includes("CHEF_PROJET")).length,
  );
  ctx.setText(
    root,
    "#usersDirectionCount",
    ctx.latestUsers.filter((user) => user.roles.includes("DIRECTION")).length,
  );
  window.lucide?.createIcons();
}

function setUserModalMode(
  root: HTMLElement,
  title: string,
  subtitle: string,
) {
  const modal = root.querySelector<HTMLElement>("#userModal");
  const subtitleNode = modal?.querySelector<HTMLElement>(
    ".text-xs.text-gray-500.font-semibold",
  );
  const titleNode = modal?.querySelector<HTMLHeadingElement>("h2");
  if (subtitleNode) subtitleNode.textContent = subtitle;
  if (titleNode) titleNode.textContent = title;
}

export function resetUserModalPage(root: HTMLElement) {
  selectedUserId = null;
  setUserModalMode(root, "Nouvel utilisateur", "Administration");
  const firstName = root.querySelector<HTMLInputElement>("#userFirstName");
  const lastName = root.querySelector<HTMLInputElement>("#userLastName");
  const identifier = root.querySelector<HTMLInputElement>("#userIdentifier");
  const email = root.querySelector<HTMLInputElement>("#userEmail");
  const password = root.querySelector<HTMLInputElement>("#userPassword");
  const active = root.querySelector<HTMLSelectElement>("#userActive");
  if (firstName) firstName.value = "";
  if (lastName) lastName.value = "";
  if (identifier) identifier.value = "";
  if (email) email.value = "";
  if (password) password.value = "";
  if (active) active.value = "true";
  root
    .querySelectorAll<HTMLInputElement>('input[name="userRole"]')
    .forEach((input) => {
      input.checked = input.value === "GESTIONNAIRE_STOCK";
    });
}

function fillUserModal(
  root: HTMLElement,
  user: StockUser,
  ctx: UtilisateursRolesContext,
) {
  selectedUserId = user.id;
  setUserModalMode(root, ctx.userDisplayName(user), "Compte utilisateur");
  const firstName = root.querySelector<HTMLInputElement>("#userFirstName");
  const lastName = root.querySelector<HTMLInputElement>("#userLastName");
  const identifier = root.querySelector<HTMLInputElement>("#userIdentifier");
  const email = root.querySelector<HTMLInputElement>("#userEmail");
  const password = root.querySelector<HTMLInputElement>("#userPassword");
  const active = root.querySelector<HTMLSelectElement>("#userActive");
  if (firstName) firstName.value = user.firstName;
  if (lastName) lastName.value = user.lastName;
  if (identifier) identifier.value = user.identifier;
  if (email) email.value = user.email ?? "";
  if (password) password.value = "";
  if (active) active.value = user.active ? "true" : "false";
  root
    .querySelectorAll<HTMLInputElement>('input[name="userRole"]')
    .forEach((input) => {
      input.checked = user.roles.includes(input.value);
    });
}

export function openUserDetailPage(
  root: HTMLElement,
  id: string,
  ctx: UtilisateursRolesContext,
) {
  const user = ctx.latestUsers.find((item: StockUser) => item.id === id);
  if (!user) {
    ctx.showToast(
      root,
      "Utilisateur introuvable dans le registre charge.",
      "error",
    );
    return;
  }
  ctx.openModal(root, "userModal");
  fillUserModal(root, user, ctx);
}

export async function submitUserPage(
  root: HTMLElement,
  ctx: UtilisateursRolesContext,
) {
  const identifier =
    root
      .querySelector<HTMLInputElement>("#userIdentifier")
      ?.value.trim()
      .toLowerCase() ?? "";
  const email =
    root
      .querySelector<HTMLInputElement>("#userEmail")
      ?.value.trim()
      .toLowerCase() ?? "";
  const firstName =
    root.querySelector<HTMLInputElement>("#userFirstName")?.value.trim() ?? "";
  const lastName =
    root.querySelector<HTMLInputElement>("#userLastName")?.value.trim() ?? "";
  const password =
    root.querySelector<HTMLInputElement>("#userPassword")?.value ?? "";
  const active =
    root.querySelector<HTMLSelectElement>("#userActive")?.value !== "false";
  const roles = Array.from(
    root.querySelectorAll<HTMLInputElement>('input[name="userRole"]:checked'),
  ).map((input) => input.value);
  if (!identifier || !firstName || !lastName) {
    ctx.showToast(root, "Identifiant, prenom et nom sont requis.", "error");
    return;
  }
  if (roles.length === 0) {
    ctx.showToast(root, "Selectionne au moins un role.", "error");
    return;
  }
  try {
    if (selectedUserId) {
      await ctx.updateUser(selectedUserId, {
        identifier,
        email: email || null,
        firstName,
        lastName,
        roles,
        password: password || undefined,
        active,
      });
      ctx.showToast(root, "Utilisateur mis a jour.");
    } else {
      await ctx.createUser({
        identifier,
        email: email || null,
        firstName,
        lastName,
        roles,
        password: password || undefined,
        active,
      });
      ctx.showToast(root, "Utilisateur cree et registre mis a jour.");
    }
    ctx.closeModal(root, "userModal");
    selectedUserId = null;
    ctx.updateApiBackedViews(root);
  } catch (error) {
    ctx.showToast(
      root,
      error instanceof Error
        ? error.message
        : "Enregistrement utilisateur impossible.",
      "error",
    );
  }
}

export function toggleUserPasswordPage(root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>("#userPassword");
  if (!input) return;
  input.type = input.type === "password" ? "text" : "password";
}
