import type { ComponentPropsWithoutRef } from "react";
import styles from "@/styles/product.module.css";
import responsiveStyles from "@/styles/responsive-shells.module.css";

type ProductPageShellProps = ComponentPropsWithoutRef<"div">;

export default function ProductPageShell({
  className,
  ...props
}: ProductPageShellProps) {
  return (
    <div
      className={
        className
          ? `${styles.scope} ${responsiveStyles.scope} ${className}`
          : `${styles.scope} ${responsiveStyles.scope}`
      }
      {...props}
    />
  );
}
