export type User = {
    type: 'contact',
    name: string,
    avatar: string,
    id: string,
    messages: Record<string, Message[]>,
    blockedContacts: string[],
    mutedContacts: string[],
    lastSeen: number | Date,
    chats: string[]
    email: string,
    chatWallpaper: string[],
    activeChatWallpaper: string,
    userId: string,
    bio: string
}


export type EmittingData = {
    to: string;
    user1: string;
    user2: string;
    message: Message;
  };
export type Role = "admin" | "member";

export type GroupChat = {
    type: 'group',
    members: (User & { role: Role })[],
    avatar: string,
    bio: string,
    name: string,
    messages: Message[],
    id: string,
    chatId: string
}

export type MessageStatus = "pending" | "received" | "read"
export type Chat = GroupChat | User
export type Message = {
    author: User,
    text: string,
    createdAt: number,
    images: [],
    id: string,
    status: MessageStatus
}

export function groupChatPredicate(value: unknown): value is GroupChat {
  return (
      typeof value === "object" &&
      value != null &&
      "type" in value &&
      "name" in value &&
      "avatar" in value &&
      "id" in value &&
      "messages" in value && 
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
      "messages" in value &&
      "blockedContacts" in value &&
      "chats" in value && 
      "activeChatWallpaper" in value && 
      "bio" in value && 
      "userId" in value && 
      "chatWallpaper" in value
    );
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