import { observer } from 'mobx-react';
import { SettingsOptionType } from '../types';
import store from "../store/store"
import SettingsOptionsList from './SettingsOptionsList';


const settingsOptions: SettingsOptionType[] = [
    {
        title: store.user?.email ?? "Uknown",
        icon: "fa-solid fa-envelope",
        description: "Your email",
        action(){

        }
    },
    {
        title: store.user?.name ?? "Uknown",
        icon: "fa-solid fa-user",
        description: "Your name",
        action(){
            
        }
    },

]
const SettingsInfo = observer(function (){
    return (
        <div className="settings_info_container">
            <div className="settings_container_avatar-wrapper">
                <img src={store.user?.avatar} alt="avatar of the user" className="settings_container_avatar" />
                <div className="settings_container_avatar_name">{ store.user?.name }</div>
            </div>
            <SettingsOptionsList options={settingsOptions} />
        </div>
    )
})


export default SettingsInfo