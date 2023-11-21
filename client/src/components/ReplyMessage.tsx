import { observer } from "mobx-react";
import {
  TextMessage,
  ImageMessage,
  imageMessagePredicate,
  textMessagePredicate,
} from "../types";
import { Dispatch, SetStateAction } from "react";
import "../styles/replyMessage.css";

type ReplyMessageProps = {
  replyMessage: TextMessage | Omit<ImageMessage, "text" | "imageUrl">;
  setReplyMessage: Dispatch<SetStateAction<ReplyMessageProps["replyMessage"] | null>>;
};
const ReplyMessage = observer(function ReplyMessage({
  replyMessage,
  setReplyMessage,
}: ReplyMessageProps) {
  return (
    <>
      <div className="reply_message_container">
        <button
          className="reply_message_button"
          onClick={() => setReplyMessage(null)}
        >
          <i className="fa-solid fa-xmark reply_message_close"></i>
        </button>
        <div
          className="reply_message_body"
          style={{
            backgroundColor: `${replyMessage?.author.randomColor.replace(
              ")",
              ""
            )}, 0.2 )`,
          }}
        >
          <h1
            className="reply_message_name"
            style={{
              color: replyMessage?.author.randomColor,
            }}
          >
            {replyMessage.author.name}
          </h1>
          {imageMessagePredicate(replyMessage) ? (
            "Photo"
          ) : (
            <h2 className="reply_message_content">
              {textMessagePredicate(replyMessage) && replyMessage.text}
            </h2>
          )}
        </div>
      </div>
    </>
  );
});
export default ReplyMessage;
