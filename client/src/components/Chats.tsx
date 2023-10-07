import type { Chat as ChatType } from "../types";
import Chat from "./Chat";

type ChatsProps = {
  chats: ChatType[];
};
function Chats({ chats }: ChatsProps) {
  return (
    <div>
      {chats.map((c) => (
        <div key={c.id}>
          <Chat chat={c} />
        </div>
      ))}
    </div>
  );
}

export default Chats;
