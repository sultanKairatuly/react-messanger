import "../styles/ui.css";

type PrimaryButtonProps = {
  children: string;
  onClick?: (...args: never[]) => unknown;
  className?: string;
  styles?: Record<string, string | number>;
};
function PrimaryButton({
  children,
  onClick: clickHandler,
  styles,
}: PrimaryButtonProps) {
  return (
    <button className="primary_button" style={styles} onClick={clickHandler}>
      {children}
    </button>
  );
}

export default PrimaryButton;
