import {  v4 as uuidv4 } from 'uuid';
import type{ Chat } from '../types';
import Chats from './Chats'
import SidebarHeader from '../components/SidebarHeader'
import '../styles/sidebar.css'

const chats: Chat[] = [
    {   
      type: 'group',
      members: [
          {
              role: 'member',
              name: "Vova",
              type: 'contact',
              avatar: "https://play-lh.googleusercontent.com/C9CAt9tZr8SSi4zKCxhQc9v4I6AOTqRmnLchsu1wVDQL0gsQ3fmbCVgQmOVM1zPru8UH=w240-h480-rw",
              id: uuidv4(),
              messages: [
                 
              ],
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
              chats: []
          },
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
      chats: []
    }
  ]

function Sidebar(){
    return (
        <div className="sidebar">
            <SidebarHeader />
            <Chats chats={chats} />  
        </div>
  
    )
}

export default Sidebar