import loginHtml from "../template-parts/login.html?raw";
import sidebarHtml from "../template-parts/sidebar.html?raw";
import workspaceHtml from "../template-parts/workspace.html?raw";
import modalsHtml from "../template-parts/modals.html?raw";
import vueStockHtml from "../pages/vue-stock/vue-stock.html?raw";
import vueStockModalsHtml from "../pages/vue-stock/vue-stock-modals.html?raw";

function HtmlPart({ html }: { html: string }) {
  return <div className="template-part" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function LoginOverlay() {
  return <HtmlPart html={loginHtml} />;
}

export function Sidebar() {
  return <HtmlPart html={sidebarHtml} />;
}

export function Workspace() {
  return <HtmlPart html={workspaceHtml.replace("<!-- vue-stock-page -->", vueStockHtml)} />;
}

export function ModalLayer() {
  return <HtmlPart html={modalsHtml.replace("<!-- vue-stock-modals -->", vueStockModalsHtml)} />;
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
