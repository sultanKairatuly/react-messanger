import store from "../store/store";
import PageHeader from "./PageHeader";
import { observer } from "mobx-react";
import "../styles/privacyAndSecurity.css";

const PrivacyAndSecurity = observer(function PrivacyAndSecurity() {
  return (
    <div>
      <PageHeader
        title="Privacy And Security"
        handleBackClick={() => (store.privacyAndSecurity = false)}
      />
      <div className="pas_container">
        <div className="pas_items">
          <div className="pas_item">
            <h1 className="pas_item_title">1. What Personal Data We Use</h1>
            <div className="pas_item_subs">
              <div className="pas_item_sub">
                <h3 className="pas_item_subtitle">
                  1.1. Basic Credentials Telegram is a communication service.
                </h3>
                <p className="pas_item_body">
                  To create a Telegram account, you provide your mobile number
                  and basic credentials (this data may include your profile
                  name, picture, and information about you). To make it easier
                  for your contacts and other people to contact you and
                  recognize who you are, your chosen screen name, profile
                  pictures and username (if you have set one) on the Telegram
                  platform will always be public. We don't want to know your
                  real name, gender, age or whatever you like.
                </p>
              </div>
              <div className="pas_item_sub">
                <h3 className="pas_item_subtitle">1.2. Email address </h3>
                <p className="pas_item_body">
                  When you enable 2-factor authentication for your account or
                  save documents using the Telegram Passport feature, you can
                  choose to set up a password reset email. If you forget that
                  address, it will only be used to send you a password reset
                  code. Yes: no more marketing emails or "we miss you" nonsense.
                </p>
              </div>
            </div>
          </div>
          <div className="pas_item">
            <h1 className="pas_item_title">
              2. Keeping your personal data safe
            </h1>
            <div className="pas_item_subs">
              <div className="pas_item_sub">
                <h3 className="pas_item_subtitle">2.1. Data storage</h3>
                <p className="pas_item_body">
                  If you are registered to Telegram in Kazakhstan, your data is
                  stored in data centers in the Netherlands. These are
                  third-party data centers where Telegram rents dedicated space.
                  However, the servers and networks located within these data
                  centers and storing your personal data are owned by Telegram.
                  As such, we do not transfer your personal data to such data
                  centers. All data is stored strictly encrypted, so local
                  Telegram engineers or physical intruders cannot access it.
                </p>
              </div>
              <div className="pas_item_sub">
                <h3 className="pas_item_subtitle">
                  2.2. Encrypted data in transit{" "}
                </h3>
                <p className="pas_item_body">
                  Your messages, media and files in private chats (see section
                  3.3.2 above), as well as the content of your calls and the
                  data you store in Telegram Passport, are processed only on
                  your device and the recipient's device. Before this data
                  reaches our servers, it is encrypted with a key known only to
                  you and the recipient. Telegram servers process this encrypted
                  data to deliver it to the recipient, or Telegram stores it in
                  the case of passport data, but we have no way of deciphering
                  the exact information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PrivacyAndSecurity;
