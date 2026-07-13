import styles from "@/components/template-capture.module.css";

export default function TemplateCaptureLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={styles.layout}>{children}</div>;
}
