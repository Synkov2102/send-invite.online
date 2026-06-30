type InvitationSectionEyebrowProps = Readonly<{
  children: string;
  className?: string;
}>;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function InvitationSectionEyebrow({
  children,
  className,
}: InvitationSectionEyebrowProps) {
  return (
    <div className={cx("invite-section-eyebrow", className)}>
      <span aria-hidden="true" />
      <strong>{children}</strong>
      <span aria-hidden="true" />
    </div>
  );
}
