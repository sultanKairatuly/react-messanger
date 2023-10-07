import SettingsInfo from './SettingsInfo'
import SettingsHeader from "./SettingsHeader"
import SettingsControls from "./SettingsControls"

function SettingsMain(){
    return (
    <div className="settings_container">
        <SettingsHeader />
        <SettingsInfo />
        <SettingsControls />
    </div>
    ) 
}


export default SettingsMain