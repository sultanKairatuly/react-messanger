import "../styles/ui.css";

type AppRadioPropsType = {
  title: string;
  checked: boolean;
  changeHandler: () => void;
  classNameRoot?: string;
};
function AppRadio({
  title,
  checked,
  changeHandler,
  classNameRoot,
}: AppRadioPropsType) {
  return (
    <div
      onClick={changeHandler}
      style={{ cursor: "pointer" }}
      className={classNameRoot + " app_radio_container"}
    >
      <input
        className="app_radio_radio"
        checked={checked}
        type="checkbox"
        
      />
      <h2 className="app_radio_title">{title}</h2>
    </div>
  );
}

export default AppRadio;
