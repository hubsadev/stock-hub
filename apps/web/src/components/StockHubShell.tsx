import loginHtml from "../template-parts/login.html?raw";
import sidebarHtml from "../template-parts/sidebar.html?raw";
import workspaceHtml from "../template-parts/workspace.html?raw";
import modalsHtml from "../template-parts/modals.html?raw";
import entreesStockHtml from "../pages/entrees-stock/entrees-stock.html?raw";
import entreesStockModalsHtml from "../pages/entrees-stock/entrees-stock-modals.html?raw";
import equipementsHtml from "../pages/equipements/equipements.html?raw";
import equipementsModalsHtml from "../pages/equipements/equipements-modals.html?raw";
import historiqueHtml from "../pages/historique/historique.html?raw";
import retoursTransfertsHtml from "../pages/retours-transferts/retours-transferts.html?raw";
import retoursTransfertsModalsHtml from "../pages/retours-transferts/retours-transferts-modals.html?raw";
import sortiesStockHtml from "../pages/sorties-stock/sorties-stock.html?raw";
import sortiesStockModalsHtml from "../pages/sorties-stock/sorties-stock-modals.html?raw";
import vueStockHtml from "../pages/vue-stock/vue-stock.html?raw";
import vueStockModalsHtml from "../pages/vue-stock/vue-stock-modals.html?raw";

function HtmlPart({ html }: { html: string }) {
  return <div className="template-part" dangerouslySetInnerHTML={{ __html: html }} />;
}

function htmlBefore(html: string, end: string) {
  const endIndex = html.indexOf(end);
  return endIndex >= 0 ? html.slice(0, endIndex).trimEnd() : "";
}

function htmlBetween(html: string, start: string, end: string) {
  const startIndex = html.indexOf(start);
  const endIndex = html.indexOf(end, startIndex);
  return startIndex >= 0 && endIndex >= 0 ? html.slice(startIndex, endIndex).trimEnd() : "";
}

function htmlFrom(html: string, start: string) {
  const startIndex = html.indexOf(start);
  return startIndex >= 0 ? html.slice(startIndex).trimEnd() : "";
}

const entryModalHtml = htmlBefore(entreesStockModalsHtml, '  <div id="entryDetailModal"');
const entryDetailModalHtml = htmlBetween(
  entreesStockModalsHtml,
  '  <div id="entryDetailModal"',
  '  <div id="entryResolutionModal"',
);
const entryResolutionModalHtml = htmlFrom(entreesStockModalsHtml, '  <div id="entryResolutionModal"');
const equipmentDetailModalHtml = htmlFrom(equipementsModalsHtml, '  <div id="equipmentDetailModal"');
const equipmentModalsHtml = htmlBefore(equipementsModalsHtml, '  <div id="equipmentDetailModal"');

export function LoginOverlay() {
  return <HtmlPart html={loginHtml} />;
}

export function Sidebar() {
  return <HtmlPart html={sidebarHtml} />;
}

export function Workspace() {
  return (
    <HtmlPart
      html={workspaceHtml
        .replace("<!-- entrees-stock-page -->", entreesStockHtml)
        .replace("<!-- vue-stock-page -->", vueStockHtml)
        .replace("<!-- sorties-stock-page -->", sortiesStockHtml)
        .replace("<!-- retours-transferts-page -->", retoursTransfertsHtml)
        .replace("<!-- equipements-page -->", equipementsHtml)
        .replace("<!-- historique-page -->", historiqueHtml)}
    />
  );
}

export function ModalLayer() {
  return (
    <HtmlPart
      html={modalsHtml
        .replace("<!-- entrees-stock-entry-modal -->", entryModalHtml)
        .replace("<!-- sorties-stock-modals -->", sortiesStockModalsHtml)
        .replace("<!-- retours-transferts-modals -->", retoursTransfertsModalsHtml)
        .replace("<!-- equipements-modals -->", equipmentModalsHtml)
        .replace("<!-- entrees-stock-detail-modal -->", entryDetailModalHtml)
        .replace("<!-- entrees-stock-resolution-modal -->", entryResolutionModalHtml)
        .replace("<!-- equipements-detail-modal -->", equipmentDetailModalHtml)
        .replace("<!-- vue-stock-modals -->", vueStockModalsHtml)}
    />
  );
}

export function StockHubShell() {
  return (
    <>
      <LoginOverlay />
      <Sidebar />
      <Workspace />
      <ModalLayer />
    </>
  );
}
