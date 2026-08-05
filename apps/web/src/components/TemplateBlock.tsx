type TemplateBlockProps = { html: string };

export function TemplateBlock({ html }: TemplateBlockProps) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
