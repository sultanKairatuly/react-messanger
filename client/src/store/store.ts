import { makeAutoObservable } from 'mobx';
import { User } from '../types';

type AppThemes = 'light' | 'dark';
type SendModes = 'enter' | 'ctrl';

type StorePrototype = {
    user: User | null,
    theme: AppThemes,
    sendMode: SendModes,
    timeFormat: 12 | 24,
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
    blured: boolean,
    chatWallpaperImage: string,
    resetAll:() => void,
    setUser(payload: User): void
}

const storePrototype: StorePrototype = {
    user: JSON.parse(localStorage.getItem('user') as string) || null,
    theme: 'light',
    sendMode: 'enter',
    timeFormat: 24,
    messageSize: 16,
    notification: false,
    blured: true,
    generalSettings: true,
    askQuestion: false,
    language: false,
    privacyAndSecurity: false,
    faq: false,
    edit: false,
    chatWallpaper: true,
    chatWallpaperColors: false,
    settings: true,
    savedMessages: false,
    chatWallpaperImage: localStorage.getItem('chwp') || "chat_bg0.jpeg",
    setUser(payload: User){
        this.user = payload;
    },
    resetAll(){
        store.askQuestion = false;
        store.notification = false;
        store.generalSettings = false;
        store.language = false;
        store.faq = false;
        store.privacyAndSecurity = false;
    }
}
const store = makeAutoObservable(storePrototype)

export default store