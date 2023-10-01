export type User = {
    type: 'contact',
    name: string,
    avatar: string,
    id: string,
    messages: Message[],
    blockedContacts: User[]
    chats: Chat[]
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