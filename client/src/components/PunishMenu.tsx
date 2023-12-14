import { Member, User } from "../types";
import AppModal from "./AppModal";
import { Dispatch, SetStateAction, useState } from "react";
import { useTranslation } from "react-i18next";

type PunishMenuProps = {
  isMenu: boolean;
  setIsMenu: Dispatch<SetStateAction<boolean>>;
  member: (User & Member) | undefined;
  punishTime: number;
  options: { title: string; value: number }[];
  punishmentType: "ban" | "mute";
  setTime: Dispatch<SetStateAction<number>>;
  punish: (...args: never[]) => unknown;
};

function PunishMenu({
  isMenu,
  setIsMenu,
  member,
  punishTime,
  punishmentType,
  options,
  setTime,
  punish,
}: PunishMenuProps) {
  const [listVisible, setListVisible] = useState(false);
  const { t } = useTranslation();

  return (
    <AppModal isModal={isMenu} setModal={setIsMenu}>
      <div className="ban_menu">
        <div>
          <h1 className="ban_menu_title">
            {t("theTime")}
            {member?.name} {t("willPunished")}{" "}
            {punishmentType === "ban" ? t("banned") : t("muted")}
          </h1>
          <br></br>
          <div className="dropdown">
            <button
              className="dropdown__button"
              onClick={() => setListVisible(!listVisible)}
            >
              {options.find((bt) => bt.value === punishTime)?.title}
            </button>
          </div>
          <ul
            className={
              (listVisible ? "dropdown__list_visible" : "") + " dropdown__list"
            }
          >
            {options.map((bt) => (
              <li
                className={
                  (punishTime === bt.value
                    ? "dropdown__list-item_active"
                    : "") + " dropdown__list-item"
                }
                onClick={() => {
                  setTime(bt.value);
                  setListVisible(false);
                }}
              >
                {bt.title}
              </li>
            ))}
          </ul>
        </div>
        <button
          className="ban_menu_btn"
          onClick={() => {
            punish();
            setIsMenu(false);
          }}
        >
          {punishmentType === "ban" ? t("Ban") : t("Mute")}
        </button>
      </div>
    </AppModal>
  );
}

export default PunishMenu;
