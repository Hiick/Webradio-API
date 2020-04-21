const formatDate = (dateFormat) => {
    const dateString = dateFormat;
    const date = new Date(dateString);
    const yr = date.getFullYear();
    const mo = date.getMonth() + 1;
    const day = date.getDate();

    let hours = date.getHours();
    let hr = hours < 10 ? '0' + hours : hours;

    let minutes = date.getMinutes();
    let min = (minutes < 10) ? '0' + minutes : minutes;

    let seconds = date.getSeconds();
    let sec = (seconds < 10) ? '0' + seconds : seconds;

    let newDateString = yr + '-' + mo  + '-' + day;
    let newTimeString = (hr-1) + ':' + min + ':' + sec;

    let excelDateString = newDateString + ' ' + newTimeString;

    return excelDateString;
};

module.exports.formatDate = formatDate;
