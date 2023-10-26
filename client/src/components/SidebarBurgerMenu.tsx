import { SidebarBurgerMenuItemType } from "../types";
import SidebarBurgerMenuItem from "./SidebarBurgerMenuItem";
import "../styles/grayMenu.css";

type SidebarBurgerMenuProps = {
  items: SidebarBurgerMenuItemType[];
  isDropdown: boolean;
};
function SidebarBurgerMenu({ items, isDropdown }: SidebarBurgerMenuProps) {
  return (
    <div
      className={
        (isDropdown
          ? "gray_menu-active"
          : "gray_menu-inactive") +
        " side_header_burger_menu gray_menu"
      }
    >
      {items.map((item) => (
        <SidebarBurgerMenuItem item={item} key={item.id} />
      ))}
    </div>
  );
}

export default SidebarBurgerMenu;
