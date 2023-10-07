import { SettingsOptionType } from "../types"
import SettingsOptions from "./SettingsOptions"

type SettingsOptionsListType = {
    options: SettingsOptionType[]
}
function SettingsOptionsList({ options }: SettingsOptionsListType){
    return (
        <div className="settings_options">
            {
                options.map((so) => (
                <div key={so.title} >
                    <SettingsOptions option={so} />
                </div>)
                )
            }
        </div>
        

    )
}

export default SettingsOptionsList