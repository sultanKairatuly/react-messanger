import "../styles/ui.css";

type AppModalProps = {
  children: React.ReactNode;
};
function AppModal({ children }: AppModalProps) {
  return (
    <div className="app_modal">
      <div className="app_modal_content">{children}</div>
    </div>
  );
}

export default AppModal;
