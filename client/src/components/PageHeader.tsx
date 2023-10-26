import "../styles/pageHeader.css";
import { useState, useEffect } from "react";
import { SettingsOptionType } from "../types";

type PageHeaderProp = {
  title: string;
  handleBackClick: () => void;
  handleEditClick?: () => void;
  dropdownItems?: SettingsOptionType[];
};

function PageHeader({
  title,
  handleBackClick,
  handleEditClick,
  dropdownItems,
}: PageHeaderProp) {
  const [dropdownMenu, setDropdownMenu] = useState(false);

  useEffect(() => {
    function cleanup() {
      document.removeEventListener("click", onClickOutside);
    }
    document.addEventListener("click", onClickOutside);
    return cleanup;
  }, []);

  function onClickOutside(e: MouseEvent) {
    const target = e.target;
    if (
      target &&
      target instanceof HTMLElement &&
      !target.closest(".settings_header_dropdown") &&
      !target.closest(".page_header_dropdown_menu")
    ) {
      setDropdownMenu(false);
    }
  }
  function openDropdownMenu() {
    setDropdownMenu(true);
  }

  return (
    <div className="settings_header">
      <div className="settings_header_head">
        <button
          className="back settings_header_button"
          onClick={handleBackClick}
        >
          <i className="fa-solid fa-left-long settings_header-icon"></i>
        </button>
        <h1 className="settings_header_title">{title}</h1>
      </div>
      {handleEditClick && dropdownItems && (
        <div className="settings_header_tail">
          <button
            className="settings_header_edit settings_header_button"
            onClick={handleEditClick}
          >
            <i className="fa-solid fa-pen settings_header-icon"></i>
          </button>
          <button
            className="settings_header_dropdown settings_header_button"
            onClick={openDropdownMenu}
          >
            <i className="fa-solid fa-ellipsis-vertical settings_header-icon"></i>
          </button>
          {
            <div
              className={
                (dropdownMenu
                  ? "page_header_dropdown_menu-active"
                  : "page_header_dropdown_menu-inactive") +
                " page_header_dropdown_menu"
              }
            >
              {dropdownItems.map((di) => (
                <div
                  className="page_header_dropdown_menu_item"
                  key={di.title}
                  onClick={di.action}
                >
                  <div className="page_header_dropdown_menu_item-head">
                    <i
                      className={
                        di.icon + " page_header_dropdown_menu_item-icon"
                      }
                    ></i>
                    <h2 className="page_header_dropdown_menu_item-title">
                      {di.title}
                    </h2>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      )}
    </div>
  );
}

export default PageHeader;
