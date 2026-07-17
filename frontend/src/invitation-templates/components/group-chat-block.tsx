import { MessagesSquare } from "lucide-react";
import styles from "./group-chat-block.module.css";
import { InvitationSectionEyebrow } from "./section-eyebrow";

type GroupChatVariant = "alpine" | "vanilla" | "aqua";

type InvitationGroupChatBlockProps = Readonly<{
  className?: string;
  show: boolean;
  text: string;
  url: string;
  variant?: GroupChatVariant;
}>;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function InvitationGroupChatBlock({
  className,
  show,
  text,
  url,
  variant = "alpine",
}: InvitationGroupChatBlockProps) {
  const trimmedUrl = url.trim();

  if (!show || !trimmedUrl) {
    return null;
  }

  return (
    <div
      className={cx(
        styles.block,
        variant === "vanilla" ? styles.vanilla : variant === "aqua" ? styles.aqua : styles.alpine,
        className,
      )}
    >
      <InvitationSectionEyebrow>Чат</InvitationSectionEyebrow>
      <h2 className={styles.title}>Общий чат</h2>
      {text.trim() ? <p className={styles.text}>{text}</p> : null}
      <a className={styles.link} href={trimmedUrl} rel="noreferrer" target="_blank">
        <MessagesSquare aria-hidden size={16} />
        Перейти в чат
      </a>
    </div>
  );
}
