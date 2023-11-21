import { SystemMessage } from "../types";

type SysMessage = {
  message: SystemMessage;
};
function SysMessage({ message }: SysMessage) {
  return (
    <div className="system_message" key={message.id}>
      {message.text}
    </div>
  );
}

export default SysMessage;
