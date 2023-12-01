import { Message } from "./types";

export function convertBaseToBlob(url: string, contentType: string = '', sliceSize: number = 512){
  const byteCharacters = atob(url);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}


export function getTimeFormatted(date: number | Date, format: 24 | 12){
    if(format === 24){
        if(date instanceof Date){
            return `${date.getHours()}:${date.getMinutes() <= 9 ? `0${date.getMinutes()}` : date.getMinutes()}`
        }else{
            const newDate = new Date(date);
            return `${newDate.getHours()}:${newDate.getMinutes() <= 9 ? `0${newDate.getMinutes()}` : newDate.getMinutes()}`
        }
    }else {

        if(date instanceof Date){
            const hours = date.getHours() > 12 ? `${date.getHours() - 12}` : `${date.getHours()}`;

            return `${hours}:${date.getMinutes() <= 9 ? `0${date.getMinutes()}` : date.getMinutes()} ${date.getHours() > 12 ? 'PM' : 'AM'}`
        }else{
            const newDate = new Date(date);
            const hours = newDate.getHours() > 12 ? `${newDate.getHours() - 12}` : `${newDate.getHours()}`;

            return `${hours}:${newDate.getMinutes() <= 9 ? `0${newDate.getMinutes()}` : newDate.getMinutes()} ${newDate.getHours() > 12 ? 'PM' : 'AM'}`
        }
    }

}

export function getRandomColor() {
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);
    return `rgb(${red}, ${green}, ${blue})`;
  }


export function formatTimeDate(date: number, locale: "en" | 'ru' = 'en'){
    const diff = Date.now() - date
    const days = Math.ceil(diff / 1000 / 60 / 60 / 24)
    const yersterday = new Date(new Date().setDate(new Date().getDate()-1))
    const weekDays = { en: ['Sunday', 'Monday', 'Tuesday', 'Wendesday', 'Thursday', 'Friday', 'Saturday'], ru: ['Воскресенья', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Воскресенье']}
    const months =  { en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November'] , ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь'] } 
    const day = Number(new Date(date).toLocaleDateString().split('.')[0])
    const month = Number(new Date(date).toLocaleDateString().split('.')[1])
    const year = Number(new Date(date).toLocaleDateString().split('.')[2])
    if(new Date(date).toLocaleDateString() === new Date(Date.now()).toLocaleDateString()){
        return locale === 'en' ? 'Today' : "Сегодня"
    }else if(new Date(date).toLocaleDateString() === new Date(yersterday).toLocaleDateString()){
        return locale === "en" ? 'Yesteday' : "Вчера"
    }else if(days <= 7){
        return `${weekDays[locale][new Date(date).getDay()]}`
    } else if(new Date(Date.now()).getFullYear() === new Date(date).getFullYear()) {
        return `${months[locale][month - 1]} ${day}`
    }else{
        return `${year} ${months[locale][month - 1]} ${day}`
    }

}


export function defineUserStatus(date: number): string{
    if(date === 0) return 'Online';
    return new Date(date).toLocaleDateString()
}

export const hasDifference = (
    messageOne: Message | undefined,
    messageTwo: Message | undefined
  ): boolean => {
    if (!messageOne || !messageTwo) return true;
    const dateOne = messageOne.createdAt;
    const dateTwo = messageTwo.createdAt;
    const days = new Date(dateOne).getDay() !== new Date(dateTwo).getDay();
    const months = new Date(dateOne).getMonth() !== new Date(dateTwo).getMonth();
    const years =
      new Date(dateOne).getFullYear() !== new Date(dateTwo).getFullYear();
      return days || years || months ? true : false;
};


export function compareArrays<T extends unknown[]>(firstObj: Record<string, unknown> | T, secondObj: Record<string, unknown> | T): boolean{
    if(Array.isArray(firstObj) && Array.isArray(secondObj)){
        if(firstObj.length !== secondObj.length){
            return false
        }
        for(let i = 0; i < firstObj.length; i++){
            if(typeof firstObj[i] !== typeof secondObj[i]){
                return false
            }else{
                const firstItem = firstObj[i]
                const secondItem = secondObj[i]
                if(Array.isArray(firstItem) && Array.isArray(secondItem)){
                    return compareArrays(firstItem, secondItem)
                }else if(typeof firstItem === 'object' &&
                !Array.isArray(firstItem) &&
                firstItem !== null &&     typeof secondItem === 'object' &&
                !Array.isArray(secondItem) &&
                secondItem !== null){
                    return compareArrays(firstItem as Record<string, unknown>, secondItem as Record<string, unknown>)
                }else{
                    if(firstItem !== secondItem){
                        return false
                    }
                }
            }
        }
    }else if(typeof firstObj === 'object' &&
    !Array.isArray(firstObj) &&
    firstObj !== null &&     typeof secondObj === 'object' &&
    !Array.isArray(secondObj) &&
    secondObj !== null){
        if(Object.keys(firstObj).length !== Object.keys(secondObj).length){
            return false
        }
        if(!Object.keys(firstObj).every((e, i) => e === Object.keys(secondObj)[i])){
            return false
        }

        for(const key in firstObj){
            const firstItem = firstObj[key]
                const secondItem = secondObj[key]
                if(Array.isArray(firstItem) && Array.isArray(secondItem)){
                    return compareArrays(firstItem, secondItem)
                }else if(typeof firstItem === 'object' &&
                !Array.isArray(firstItem) &&
                firstItem !== null &&     typeof secondItem === 'object' &&
                !Array.isArray(secondItem) &&
                secondItem !== null){
                    return compareArrays(firstItem as Record<string, unknown>, secondItem as Record<string, unknown>)
                }else{
                    if(firstItem !== secondItem){
                        return false
                    }
                }
        }
    }else{
        return false
    }
    return true
}
