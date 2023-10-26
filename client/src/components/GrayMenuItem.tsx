import { GrayMenuItemType, Message } from "../types";

type GrayMenuItemProps = {
  item: GrayMenuItemType;
  message?: Message;
};
function GrayMenuItem({ item, message }: GrayMenuItemProps) {
  return (
    <div
      onClick={() => item.action(message)}
      className={
        (item.title.includes("Delete") ? "gray_menu_head_red" : "") +
        " gray_menu_item"
      }
    >
      <div className="gray_menu_head">
        <i className={item.icon + " gray_menu_item_icon"}></i>
        <div className="gray_menu_item_title">{item.title}</div>
      </div>
    </div>
  );
}

export default GrayMenuItem;
