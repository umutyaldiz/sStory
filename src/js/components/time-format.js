const timeformat = (ts,language) => {
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsedTime = new Date() - new Date(parseInt(ts));
    var returnItem = "";

    if (elapsedTime < msPerMinute) {
        returnItem = `Math.round(elapsedTime / 1000) ${language.second}`;
    } else if (elapsedTime < msPerHour) {
        returnItem = Math.round(elapsedTime / msPerMinute) + " dakika önce";
    } else if (elapsedTime < msPerDay) {
        returnItem = Math.round(elapsedTime / msPerHour) + " saat önce";
    } else if (elapsedTime < msPerMonth) {
        returnItem = Math.round(elapsedTime / msPerDay) + " gün önce";
    } else if (elapsedTime < msPerYear) {
        returnItem = `${Math.round(elapsedTime / msPerMonth)} ${language.mounth}`;
    } else {
        returnItem = Math.round(elapsedTime / msPerYear) + " yıl önce";
    }

    return returnItem;
}

export default timeformat;