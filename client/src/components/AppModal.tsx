import "../styles/ui.css";
import { createPortal } from "react-dom";
import { Dispatch, SetStateAction, useEffect, memo } from "react";

type AppModalProps = {
  children: React.ReactNode;
  isModal: boolean;
  setModal: Dispatch<SetStateAction<boolean>>;
};
const AppModal = memo(function AppModal({ children, isModal, setModal }: AppModalProps) {
  useEffect(() => {
    const onClickHandler = (e: MouseEvent) => {
      const target = e.target;
      if (target instanceof HTMLElement) {
        if (
          !(target.closest(".app_modal_content") ||
          target.closest(".gray_menu_item"))
        ) {
          setModal(false);
        }
      }
    };
    document.addEventListener("click", onClickHandler);
    return () => {
      document.removeEventListener("click", onClickHandler);
    };
  }, []);
  return createPortal(
    <div
      className={
        (isModal ? "app_modal-active" : "app_modal-inactive") + " app_modal"
      }
    >
      <div className="app_modal_content">
        <>{children}</>
        <button className="close_modal" onClick={() => setModal(false)}>
          <i className="fa-solid fa-xmark close_modal_icon"></i>
        </button>
      </div>
    </div>,
    document.body
  );
})

export default AppModal;
