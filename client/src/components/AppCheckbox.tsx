import { observer } from 'mobx-react';
import '../styles/ui.css'

type AppCheckboxProps = {
    title: string,
    checked: boolean,
    handleClick: (...args: never[]) => unknown,
    description?: string
}
const AppCheckbox = observer(function ({ title, checked, handleClick, description }: AppCheckboxProps){
    return (
        <div className="app_checkbox_container"  onClick={handleClick}>   
            <div className="app_checkbox_checked">
                <div className={ (checked ? "app_checkbox_outer_circle_active" : "app_checkbox_outer_circle_inactive" ) + " app_checkbox_outer_circle"}>
                    <div className={"app_checkbox_inner_circle"}></div>
                </div>
            </div>
            <div className="app_checkbox_text">
                <h3 className="app_checkbox_title">{title}</h3>
                <p className="app_checkbox_decription">{description}</p>
            </div>
      
        </div>
    )
})

export default AppCheckbox