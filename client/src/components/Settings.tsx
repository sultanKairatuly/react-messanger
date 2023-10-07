import '../styles/settings.css'
import store from '../store/store'
import { observer } from 'mobx-react'
import GeneralSettings from './GeneralSettings'
import SettingsMain from './SettingsMain'


const Settings = observer(function Settings(){
    const allFalsy = !store.notification && !store.askQuestion && !store.language && !store.privacyAndSecurity && !store.faq && !store.generalSettings
    
    return (
        <div>
            { allFalsy && <SettingsMain />}
            { store.generalSettings && <GeneralSettings />}
        </div>

    )
})

export default Settings