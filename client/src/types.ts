export type User = {
    type: 'contact',
    name: string,
    avatar: string,
    id: string,
    blockedContacts: string[],
    mutedContacts: string[],
    lastSeen: number,
    chats: string[]
    email: string,
    chatWallpaper: string[],
    activeChatWallpaper: string,
    userId: string,
    bio: string,
    randomColor: string
}


export type EmittingData = {
    to: string;
    user1: string;
    user2: string;
    message: Message;
    type: "group" | "contact",
    socketId: string
};
export type Role = "admin" | "member";
export type Member = {
  role: Role,
  userId: string
}
export type GroupChat = {
    type: 'group',
    members: Member[],
    avatar: string,
    bio: string,
    name: string,
    id: string,
    chatId: string,
    randomColor: string
}
export type ReplyMessage = (Omit<TextMessage, 'type'> | Omit<ImageMessage, 'type'>) & { replyMessage:  TextMessage | Omit<ImageMessage, 'text' | 'imageUrl'> , type: 'reply' }
export type MessageStatus = "pending" | "received" | "read"
export type Chat = GroupChat | User
export type MessageType = 'text' | 'image' | 'system' | 'video'
export type Message = TextMessage | SystemMessage | ImageMessage | ReplyMessage
export type TextMessage = {
  author: User,
  text: string,
  createdAt: number,
  id: string,
  status: MessageStatus,
  type: 'text'
}
export type SystemMessage = {
  text: string,
  id: string,
  type: 'system'
  createdAt: number
}


export type MessageQueryText = {
  type: 'text'
}
export type MessageQueryImage = {
  type: "image"; imageUrl: string; text: string
}
export type MessageQueryReply = {
  type: 'reply',
  replyingMessage: TextMessage | Omit<ImageMessage, "text" | "imageUrl">
} & ({
  dataType: 'text'
} | { dataType: 'image', imageUrl: string, text: string})
export type MessageQuery = | MessageQueryText | MessageQueryImage | MessageQueryReply
export type ImageMessage = Omit<TextMessage, 'type'> & { type: 'image', text: string, imageUrl: string }

export function textMessagePredicate(value: unknown): value is TextMessage {
    return (
      typeof value === "object" &&
      value != null &&
      "author" in value &&
      "text" in value &&
      "createdAt" in value &&
      "id" in value &&
      "status" in value && 
      "type" in value &&
      value.type === 'text'
  )
}

export function systemMessagePredicate(value: unknown): value is SystemMessage {
  return (
    typeof value === "object" &&
    value != null &&
    "text" in value &&
    "createdAt" in value &&
    "id" in value &&
    "type" in value &&
    value.type === 'system'
)
}


export function imageMessagePredicate(value: unknown): value is ImageMessage {
  return (
    typeof value === "object" &&
    value != null &&
    "author" in value &&
    "text" in value &&
    "createdAt" in value &&
    "id" in value &&
    "status" in value && 
    "type" in value &&
    "imageUrl" in value && 
    value.type === 'image'
)
}

export function replyMessagePredicate(value: unknown): value is ReplyMessage {
  return (
    typeof value === "object" &&
    value != null &&
    "author" in value &&
    "text" in value &&
    "createdAt" in value &&
    "id" in value &&
    "status" in value && 
    "type" in value &&
    "replyMessage" in value && 
    value.type === 'reply'
  )
}

export function groupChatPredicate(value: unknown): value is GroupChat {
  return (
      typeof value === "object" &&
      value != null &&
      "type" in value &&
      "name" in value &&
      "avatar" in value &&
      "id" in value &&
      "members" in value &&
      "bio" in value 
  )
}
export function userPredicate(value: unknown): value is User {
    return (
      value != null &&
      typeof value === "object" &&
      "password" in value &&
      "email" in value &&
      "type" in value &&
      "name" in value &&
      "avatar" in value &&
      "id" in value &&
      "blockedContacts" in value &&
      "chats" in value && 
      "activeChatWallpaper" in value && 
      "bio" in value && 
      "userId" in value && 
      "chatWallpaper" in value
    );
}

export function notSystemMessagePredicate(value: unknown): value is Exclude<Message, SystemMessage> {
  return !systemMessagePredicate(value)
}

export type GrayMenuType = 'default' | 'range' | 'checkbox'
export type GrayMenuItemType = {
    title: string,
    icon: string,
    id: string,
    action: (message?: Message) => void,
}

export type SidebarBurgerMenuItemType = (GrayMenuItemType & { type: 'checkbox', checked: boolean }) | (GrayMenuItemType & { type: 'default' })

export function chatPredicate(value: unknown): value is Chat{
    return userPredicate(value) || groupChatPredicate(value) 
}
  
  export type SettingsOptionType = {
    title: string,
    icon: string,
    description?: string,
    action: () => void
}

