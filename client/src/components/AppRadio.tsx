import "../styles/ui.css";

type AppRadioPropsType = {
  title: string;
  checked: boolean;
  clickHandler: () => void;
  classNameRoot: string;
};
function AppRadio({
  title,
  checked,
  clickHandler,
  classNameRoot,
}: AppRadioPropsType) {
  return (
    <div
      className={classNameRoot + " app_radio_container"}
      onClick={clickHandler}
    >
      <input
        className="app_radio_radio"
        defaultChecked={checked}
        type="checkbox"
      />
      <h2 className="app_radio_title">{title}</h2>
    </div>
  );
}

export default AppRadio;
