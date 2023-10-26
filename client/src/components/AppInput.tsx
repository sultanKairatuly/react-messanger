import "../styles/ui.css";

type AppInputProps = {
  type?: "text" | "password" | "file" | "button" | "tel" | "number";
  placeholder?: string;
  value: string;
  changeHandler(e: React.ChangeEvent<HTMLInputElement>): void;
  children?: React.ReactNode;
  labelFor: string;
  labelTitle: string;
  limit?: number;
};
function AppInput(props: AppInputProps) {
  return (
    <label htmlFor={props.labelFor} className="app_input_label">
      <h2 className="app_input_label_title">{props.labelTitle}</h2>
      <div className="app_input_wrapper">
        <input
          value={props.value}
          placeholder={props.placeholder}
          type={props.type || "text"}
          onChange={(e) => {
            if (props.limit) {
              if (props.limit - props.value.length) {
                props.changeHandler(e);
              }
            } else {
              props.changeHandler(e);
            }
          }}
          className="app_input"
        />
        {props.children}
        {props.limit && (
          <div className="app_input_limit">
            {props.limit - props.value.length}
          </div>
        )}
      </div>
    </label>
  );
}

export default AppInput;
