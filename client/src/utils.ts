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


export function formatTimeDate(date: number){
    const diff = Date.now() - date
    const days = Math.ceil(diff / 1000 / 60 / 60 / 24)
    const yersterday = new Date(new Date().setDate(new Date().getDate()-1))
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wendesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November']
    const day = Number(new Date(date).toLocaleDateString().split('.')[0])
    const month = Number(new Date(date).toLocaleDateString().split('.')[1])
    const year = Number(new Date(date).toLocaleDateString().split('.')[2])
    if(new Date(date).toLocaleDateString() === new Date(Date.now()).toLocaleDateString()){
        return 'Today'
    }else if(new Date(date).toLocaleDateString() === new Date(yersterday).toLocaleDateString()){
        return 'Yesteday'
    }else if(days <= 7){
        return `${weekDays[new Date(date).getDay()]}`
    } else if(new Date(Date.now()).getFullYear() === new Date(date).getFullYear()) {
        return `${months[month - 1]} ${day}`
    }else{
        return `${year} ${months[month - 1]} ${day}`
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
  