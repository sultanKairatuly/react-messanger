import { makeAutoObservable } from 'mobx';
import {  User } from '../types';

type AppThemes = 'light' | 'dark';
type SendModes = 'enter' | 'ctrl';
type TimeFormats = 12 | 24

type StorePrototype = {
    user: User | null,
    theme: AppThemes,
    sendMode: SendModes,
    timeFormat: TimeFormats,
    messageSize: number,
    notification: boolean,
    generalSettings: boolean,
    askQuestion: boolean,
    language: boolean,
    privacyAndSecurity: boolean,
    faq: boolean,
    edit: boolean,
    chatWallpaper: boolean,
    chatWallpaperColors: boolean,
    settings: boolean,
    savedMessages: boolean,
    notificationMessage: string,
    blured: boolean,
    messageTextSize: number,
    resetAll:() => void,
    setUser(payload: User): void,
    setNotificationMessage(message: string, ms?: number): void,
    addMessage(message: string, chatId: string): void
}

const storePrototype: StorePrototype = {
    user: JSON.parse(localStorage.getItem('user') as string) || null,
    theme: 'light',
    sendMode: localStorage.getItem('sendMode') as  SendModes || 'enter',
    timeFormat: Number(localStorage.getItem('timeFormat')) as TimeFormats || 24,
    messageSize: 16,
    notification: false,
    blured: true,
    generalSettings: false,
    askQuestion: false,
    language: false,
    privacyAndSecurity: false,
    faq: false,
    edit: false,
    chatWallpaper: false,
    chatWallpaperColors: false,
    settings: false,
    notificationMessage: "",
    savedMessages: false,
    messageTextSize: 16,
    setNotificationMessage(message: string, ms: number = 1500){
        this.notificationMessage = message;
        setTimeout(() => {
            this.notificationMessage = ""
        }, ms);
    },
    setUser(payload: User){
        this.user = payload;
        localStorage.setItem('user', JSON.stringify(this.user));
    },
    resetAll(){
        store.askQuestion = false;
        store.notification = false;
        store.generalSettings = false;
        store.language = false;
        store.faq = false;
        store.privacyAndSecurity = false;
    },
    addMessage(message, chatId){
        const parsed = JSON.parse(message);
        console.log('parsed: ', parsed)
        this.user?.messages[chatId].push(parsed)
    }
}
const store = makeAutoObservable(storePrototype)

export default store