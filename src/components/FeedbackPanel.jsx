import "./FeedbackPanel.css";

const FeedbackPanel = ({ tone = "neutral", title, message, actionLabel, onAction }) => {
  const isError = tone === "error";

  return (
    <div
      className={`feedback-panel feedback-panel--${tone}`}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
    >
      <p className="feedback-panel__title">{title}</p>
      <p className="feedback-panel__message">{message}</p>
      {onAction && actionLabel && (
        <button className="feedback-panel__button" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default FeedbackPanel;
