import { SettingsOptionType } from "../types"

type SettingsOptionPropsType = {
    option: SettingsOptionType
}
function SettingsOption({ option }: SettingsOptionPropsType){
    return (
        <div className="settings_option" onClick={option.action}>
        <i className={option.icon + " settings_option_icon"}></i>
        <div className="settings_option_text">
            <div className="settings_option_text_title">{option.title}</div>
            { option.description && <div className="settings_option_text_description">{option.description}</div>}
        </div>
        </div>
    )
}

export default SettingsOption