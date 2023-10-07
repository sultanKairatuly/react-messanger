export type User = {
    type: 'contact',
    name: string,
    avatar: string,
    id: string,
    messages: Message[],
    blockedContacts: User[]
    chats: Chat[]
    email: string,
    chatWallpaper: string[],
    activeChatWallpaper: string
}
export type Role = "admin" | "member";

export type GroupChat = {
    type: 'group',
    members: (User & { role: Role })[],
    groupAvatar: string,
    description: string,
    title: string,
    messages: Message[],
    id: string
}


export type Chat = GroupChat | User
export type Message = {
    author: User,
    text: string,
    createdAt: Date | number,
    images: [],
    id: string
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
      "chats" in value
    );
  }
  
  export type SettingsOptionType = {
    title: string,
    icon: string,
    description?: string,
    action: () => void
}