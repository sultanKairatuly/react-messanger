import { GrayMenuItemType, Message } from "../types";
import GrayMenuItem from "./GrayMenuItem";
import "../styles/grayMenu.css";

type GrayMenuProps = {
  items: GrayMenuItemType[];
  message?: Message;
  isMenu: boolean;
  position?: { x: number; y: number };
  animationFrom?: string;
};
function GrayMenu({
  items,
  message,
  isMenu,
  position = { x: 0, y: 0 },
  animationFrom: transformOrigin = "top left",
}: GrayMenuProps) {
  return (
    <div
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        transformOrigin,
      }}
      className={
        (isMenu ? "gray_menu-active" : "gray_menu-inactive") + " gray_menu"
      }
    >
      {items.map((item) => (
        <GrayMenuItem message={message} item={item} key={item.id} />
      ))}
    </div>
  );
}

export default GrayMenu;
