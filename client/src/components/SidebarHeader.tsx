import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { v4 as uuidv4 } from "uuid";
import "../styles/sidebarHeader.css";
import store from "../store/store";
import { observer } from "mobx-react";
import { SidebarBurgerMenuItemType } from "../types";
import SidebarBurgerMenu from "./SidebarBurgerMenu";

// type DropdownItemDefault = {
//   type: "default";
//   title: string;
//   icon: string;
//   action: (...args: never) => unknown;
//   id: string;
// };

// type DropdownItemCheckbox = Omit<DropdownItemDefault, "type"> & {
//   type: "checkbox";
//   checked: boolean;
// };
// type DropdownItem = DropdownItemDefault | DropdownItemCheckbox;
type SidebarHeaderProps = {
  setSidebarSearch: Dispatch<SetStateAction<boolean>>;
  sidebarSearch: boolean;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
};

const SidebarHeader = observer(function SidebarHeader({
  setSidebarSearch,
  sidebarSearch,
  setSearchQuery,
  searchQuery,
}: SidebarHeaderProps) {
  useEffect(() => {
    function cleanup() {
      document.removeEventListener("click", onClickOutside);
    }
    document.addEventListener("click", onClickOutside);
    return cleanup;
  }, []);
  const initialDropdownItems: SidebarBurgerMenuItemType[] = [
    {
      title: "Settings",
      type: "default",
      action() {
        store.settings = true;
      },
      icon: "fa-solid fa-gear",
      id: uuidv4(),
    },
    {
      title: "Saved Messages",
      type: "default",
      action() {
        store.savedMessages = true;
      },
      icon: "fa-solid fa-bookmark",
      id: uuidv4(),
    },
    {
      title: "Night Mode",
      type: "checkbox",
      action() {
        const newTheme = store.theme === "light" ? "dark" : "light";
        store.theme = newTheme;
      },
      icon: "fa-solid fa-moon",
      id: uuidv4(),
      checked: store.theme === "dark",
    },
  ];
  const [activeInput, setActiveInput] = useState(false);
  const dropdownItems = initialDropdownItems;
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const searchIconDynamicClassName = activeInput
    ? "sidebar_header_search_icon-active"
    : "";

  function onClickOutside(e: MouseEvent) {
    const target = e.target;
    if (
      target &&
      target instanceof HTMLElement &&
      !target.closest(".sidebar_header_dropdown_menu") &&
      !target.closest(".sidebar_header_menu") &&
      target.closest(".side_header_menu_back")
    ) {
      setDropdownMenu(false);
    }
  }

  function handleSearchMouseDown() {
    setActiveInput(true);
    setSidebarSearch(true);
  }

  function handleSearchMouseUp() {
    setActiveInput(false);
  }
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const target = e.target;
    setSearchQuery(target.value);
  }

  function handleXmarkClick() {
    setSearchQuery("");
  }

  return (
    <div className="sidebar_header">
      <div
        className={
          (sidebarSearch ? "side_header_menu_back" : "") +
          " sidebar_header_menu"
        }
        onClick={() => {
          const close = document.querySelector(".side_header_menu_back");
          console.log(close);
          if (!close) {
            setDropdownMenu(!dropdownMenu);
          } else {
            setSidebarSearch(false);
          }
        }}
      >
        <div className="sidebar_header_menu_bar sidebar_header_menu_bar_one"></div>
        <div className="sidebar_header_menu_bar sidebar_header_menu_bar_two"></div>
        <div className="sidebar_header_menu_bar sidebar_header_menu_bar_three"></div>
      </div>
      <SidebarBurgerMenu isDropdown={dropdownMenu} items={dropdownItems} />
      <div className="sidebar_header_search_container">
        <i
          className={
            searchIconDynamicClassName +
            " fa-solid fa-magnifying-glass sidebar_header_search_icon"
          }
        ></i>
        <input
          type="text"
          onFocus={handleSearchMouseDown}
          onBlur={handleSearchMouseUp}
          onChange={handleSearchChange}
          value={searchQuery}
          className="sidebar_header_search"
          placeholder="Search"
        />
        <div
          className="sidebar_header_search_xmark_wrapper"
          style={
            searchQuery.length ? { display: "block" } : { display: "none" }
          }
          onClick={handleXmarkClick}
        >
          <i className={"fa-solid fa-xmark sidebar_header_search_xmark"}></i>
        </div>
      </div>
    </div>
  );
});

export default SidebarHeader;
