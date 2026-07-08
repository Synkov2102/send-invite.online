export default function TemplateCaptureLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="template-capture-layout">{children}</div>;
}
