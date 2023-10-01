import { Chat as ChatType, GroupChat, User } from "../types"
import '../styles/Chat.css'

type ChatProps = {
    chat: ChatType
}
function Chat({ chat }: ChatProps){
    function renderGroup(group: GroupChat){
        return (
            <div className="chat_container">
                <div className="chat_image-wrapper">
                    <img className="chat_image" src={group.groupAvatar} alt="groupAvatar" />
                </div>
                <div className="chat_info" >
                    <h2 className="chat_title">{group.title}</h2>
                    <p className="last_message">
                        <span className="last_message-author">{group.messages.at(-1)?.author.name}:</span>
                        <span className="last_message-text">{group.messages.at(-1)?.text}</span>
                        </p>
                </div>
            </div>
        )
    }

    function renderContact(contact: User){
         //! The last message's text of the current authorized user's conversation with contact !!
        return (
            <div className="chat_container">
                <div className="chat_image-wrapper">
                    <img className="chat_image" src={contact.avatar} alt="groupAvatar" />
                </div>
                <div className="chat_info" >
                    <h2 className="chat_title">{contact.name}</h2>
                    <p className="last_message">
                        <span className="last_message-author"></span> 
                        <span className="last_message-text"></span>
                        </p>
                </div>
            </div>
        )
    }

    return (
        chat.type === 'group' ? renderGroup(chat) : renderContact(chat)
    )
}

export default Chat