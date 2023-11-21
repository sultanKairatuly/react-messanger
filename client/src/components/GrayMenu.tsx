import { GrayMenuItemType, Message } from "../types";
import GrayMenuItem from "./GrayMenuItem";
import "../styles/grayMenu.css";

type GrayMenuProps = {
  items: GrayMenuItemType[];
  message?: Message;
  isMenu: boolean;
  x?: "right" | "left";
  y?: "top" | "bottom";
  position?: { x: number; y: number };
  animationFrom?: string;
};
function GrayMenu({
  items,
  message,
  isMenu,
  x = "left",
  y = "top",
  position = { x: 0, y: 0 },
  animationFrom: transformOrigin = "top left",
}: GrayMenuProps) {
  return (
    <div
      style={{
        [y]: `${position.y}px`,
        [x]: `${position.x}px`,
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
