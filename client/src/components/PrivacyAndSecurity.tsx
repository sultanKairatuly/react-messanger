import store from "../store/store";
import PageHeader from "./PageHeader";
import { observer } from "mobx-react";
import "../styles/privacyAndSecurity.css";
import { useTranslation } from "react-i18next";

const PrivacyAndSecurity = observer(function PrivacyAndSecurity() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        title={t("Privacy and Security")}
        handleBackClick={() => (store.privacyAndSecurity = false)}
      />
      <div className="pas_container">
        <div className="pas_items">
          <div className="pas_item">
            <h1 className="pas_item_title">{t("pas1")}</h1>
            <div className="pas_item_subs">
              <div className="pas_item_sub">
                <h3 className="pas_item_subtitle">{t("pas11")}</h3>
                <p className="pas_item_body">{t("pas11text")}</p>
              </div>
              <div className="pas_item_sub">
                <h3 className="pas_item_subtitle">{t("pas12")}</h3>
                <p className="pas_item_body">{t("pas12text")}</p>
              </div>
            </div>
          </div>
          <div className="pas_item">
            <h1 className="pas_item_title">{t("pas2")}</h1>
            <div className="pas_item_subs">
              <div className="pas_item_sub">
                <h3 className="pas_item_subtitle">{t("pas21")}</h3>
                <p className="pas_item_body">{t("pas21text")}</p>
              </div>
              <div className="pas_item_sub">
                <h3 className="pas_item_subtitle">{t("pas22")}</h3>
                <p className="pas_item_body">{t("pas22text")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PrivacyAndSecurity;
