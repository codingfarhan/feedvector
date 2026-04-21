import { TemplatesLayout } from '@gitroom/frontend/components/templates/templates.layout';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TemplatesLayout>{children}</TemplatesLayout>;
}

