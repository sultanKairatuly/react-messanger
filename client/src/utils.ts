export function convertBaseToBlob(url: string){
    const src = url.replace('data:image/jpeg;base64,', '')
    console.log(src)
    const byteCharacters = atob(src);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: 'image/gif'});
    const imageUrl = URL.createObjectURL(blob);
    return imageUrl
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


export function formatTimeDate(date: number){
    const diff = Date.now() - date
    const days = Math.ceil(diff / 1000 / 60 / 60 / 24)
    const yersterday = new Date(new Date().setDate(new Date().getDate()-1))
    const weekDays = ['Monday', 'Tuesday', 'Wendesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November']
    const day = Number(new Date(date).toLocaleDateString().split('.')[0])
    const month = Number(new Date(date).toLocaleDateString().split('.')[1])
    const year = Number(new Date(date).toLocaleDateString().split('.')[2])
    if(new Date(date).toLocaleDateString() === new Date(Date.now()).toLocaleDateString()){
        return 'Today'
    }else if(new Date(date).toLocaleDateString() === new Date(yersterday).toLocaleDateString()){
        return 'Yesteday'
    }else if(days <= 7){
        return `${weekDays[days - 1]}`
    } else if(new Date(Date.now()).getFullYear() === new Date(date).getFullYear()) {
        return `${months[month - 1]} ${day}`
    }else{
        return `${year} ${months[month - 1]} ${day}`
    }

}
