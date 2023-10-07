import Chats from './Chats';
import type{ Chat } from '../types';
import { v4 as uuidv4 } from 'uuid'
import { observer } from 'mobx-react';
import SidebarHeader from './SidebarHeader';

const chats: Chat[] = [
    {   
      type: 'group',
      members: [
          {
              role: 'member',
              name: "Vova",
              type: 'contact',
              avatar: "https://play-lh.googleusercontent.com/C9CAt9tZr8SSi4zKCxhQc9v4I6AOTqRmnLchsu1wVDQL0gsQ3fmbCVgQmOVM1zPru8UH=w240-h480-rw",
              email: "vova@mail.ru",
              id: uuidv4(),
              messages: [],
              blockedContacts: [],
              chats: []
          }
      ],
      groupAvatar: 'https://community.adobe.com/t5/image/serverpage/image-id/145201iE0ECF5C6ECBD959E/image-size/large/is-moderation-mode/true?v=v2&px=999',
      description: 'Это сообшество',
      title: 'Сообщество Разработчиков',
      messages: [ {
           author: {
              type: 'contact',
              name: 'Katya',
              avatar: 'https://e0.pxfuel.com/wallpapers/889/641/desktop-wallpaper-aesthetic-tiktok-aesthetic-profile-pic.jpg',
              id: uuidv4(),
              messages: [],
              email: "katya@mail.ru",
              chats: [],
              blockedContacts: [],
          },
          images: [],
          text: "Hello",
          id: 'ssa',
          createdAt: 121212312
      }],
      id: uuidv4()
    },
    {
      type: 'contact',
      name: 'Katya',
      avatar: 'https://e0.pxfuel.com/wallpapers/889/641/desktop-wallpaper-aesthetic-tiktok-aesthetic-profile-pic.jpg',
      id: uuidv4(),
      messages: [],
      chats: [],
      blockedContacts: [],
      email: "katya@mail.ru",
    }
]

const Sidebar = observer(function(){
    return (
        <div>
            <SidebarHeader />
            <Chats chats={chats} />
        </div>
    )
})

export default Sidebar