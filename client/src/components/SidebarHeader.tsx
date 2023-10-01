import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import '../styles/sidebarHeader.css'

type DropdownItemDefault = {
    type: "default",
    title: string,
    icon: string,
    action: (...args: never) => unknown,
    id: string
}

type DropdownItemCheckbox = Omit<DropdownItemDefault, 'type'> & {
    type: "checkbox",
    checked: boolean;
}
type DropdownItem = DropdownItemDefault | DropdownItemCheckbox

function SidebarHeader(){

    document.addEventListener('click', onClickOutside)
    
    const initialDropdownItems: DropdownItem[] = [
        {
            title: "Settings",
            type: "default",
            action(){},
            icon: "fa-solid fa-gear",
            id: uuidv4()
        },
        {
            title: "Saved Messages",
            type: "default",
            action(){},
            icon: "fa-solid fa-bookmark",
            id: uuidv4()
        },
        {
            title: "Night Mode",
            type: "checkbox",
            action(){},
            icon: "fa-solid fa-moon",
            id: uuidv4(),
            checked: false,
        },
    ]
    const [searchQuery, setSearchQuery ] = useState("");
    const [activeInput, setActiveInput] = useState(false);
    const [dropdownItems, setDropdownItems] = useState(initialDropdownItems)
    const [dropdownMenu, setDropdownMenu] = useState(false)
    const searchIconDynamicClassName = activeInput ? "sidebar_header_search_icon-active" : "" 

    function onClickOutside(e: MouseEvent){
        const target = e.target;
        if(target && target instanceof HTMLElement && !target.closest('.sidebar_header_dropdown_menu') && !target.closest(".sidebar_header_menu")){
            setDropdownMenu(false)
        }
    }


    function handleSearchMouseDown() {
        setActiveInput(true);
    }

    function handleSearchMouseUp() {
        setActiveInput(false);
    }
    function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>){
        const target = e.target
        setSearchQuery(target.value)
    }

    function handleXmarkClick() {
        setSearchQuery("");
    }

    function renderDropdownCheckbox(dropdownItem: DropdownItemCheckbox){
        const toggleDropdownCheckbox = () => {
            const updatedDropdownItems = dropdownItems.map(item => {
                if(item.id === dropdownItem.id){
                    if(item.type === 'checkbox'){
                        return {
                            ...item,
                            checked: !item.checked
                        }
                    }
                }

                return item
            })    
            setDropdownItems(updatedDropdownItems)
        }

        return (
            <div className="dropdown_item_checkbox">
                <div className={dropdownItem.checked ? "dropdown_item_checkbox_circle checkbox_circle-unchecked" : "dropdown_item_checkbox_circle checkbox_circle-checked" } onClick={toggleDropdownCheckbox}>

                </div>
            </div>
        )
    }

    return (
        <div className="sidebar_header">
                    {dropdownMenu}
            <div className="sidebar_header_menu" onClick={() => setDropdownMenu(!dropdownMenu)}>
                    <div className="sidebar_header_menu_bar"></div>
                    <div className="sidebar_header_menu_bar"></div>
                    <div className="sidebar_header_menu_bar"></div>
            </div> 
            { <div className={(dropdownMenu ? "sidebar_header_dropdown_menu-active" : "sidebar_header_dropdown_menu-inactive") +  " sidebar_header_dropdown_menu"}>
                {
                    dropdownItems.map(di => (
                        <div className="sidebar_header_dropdown_menu_item" key={di.id}>
                            <div className="sidebar_header_dropdown_menu_item-head">
                                <i className={di.icon + " sidebar_header_dropdown_menu_item-icon"}></i>
                                <h2 className="sidebar_header_dropdown_menu_item-title">{di.title}</h2>
                            </div>
                            {di.type === 'checkbox' && renderDropdownCheckbox(di)}
                        </div>
                    ))
                }
            </div>}
            <div className="sidebar_header_search_container">
                <i className={ searchIconDynamicClassName + " fa-solid fa-magnifying-glass sidebar_header_search_icon"}></i>
                <input type="text" onFocus={handleSearchMouseDown} onBlur={handleSearchMouseUp} onChange={handleSearchChange} value={searchQuery} className="sidebar_header_search" placeholder="Search" />
                <div 
                className="sidebar_header_search_xmark_wrapper" 
                style={searchQuery.length ? {display: "block"} : {display: "none"}}
                onClick={handleXmarkClick}                
                >
                <i className={ "fa-solid fa-xmark sidebar_header_search_xmark"}></i>
                </div>
            </div>
        </div>        
    )
}


export default SidebarHeader