import styles from "@/styles/invitation-base.module.css";

export default function InviteSiteLoading() {
  return (
    <main className={`${styles.scope} site-loading`} aria-busy="true">
      <div className="site-loading__mark">
        <span />
        <span />
      </div>
      <p>Открываем приглашение</p>
    </main>
  );
}
