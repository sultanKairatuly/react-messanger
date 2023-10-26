import { SidebarBurgerMenuItemType } from "../types";

type SidebarBurgerMenuItemProps = {
  item: SidebarBurgerMenuItemType;
};

function SidebarBurgerMenuItem({ item }: SidebarBurgerMenuItemProps) {
  return (
    <div onClick={() => item.action()} className={"gray_menu_item"}>
      <div className="gray_menu_head">
        <i className={item.icon + " gray_menu_item_icon"}></i>
        <div className="gray_menu_item_title">{item.title}</div>
      </div>
      <div className="gray_menu_tail">
        {item.type === "checkbox" && (
          <div
            className={
              (item.checked
                ? "gray_menu_checkbox_circle_active"
                : "gray_menu_checkbox_circle_inactive") + " gray_menu_checkbox"
            }
          >
            <div className={" gray_menu_checkbox_circle"}></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SidebarBurgerMenuItem;
