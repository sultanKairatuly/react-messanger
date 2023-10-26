import "../styles/ui.css";

type EmptyMessageProps = {
  children: React.ReactNode;
  style?: Record<string, string | number>;
};
function AppEmptyMessage({ children, style }: EmptyMessageProps) {
  return (
    <div className="app_empty_message_container" style={style}>
      {children}
    </div>
  );
}

export default AppEmptyMessage;
