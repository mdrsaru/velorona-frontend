interface IProps {
    duration: any
}
const TimeDuration = (props: IProps) => {
    
    function secondsToHms(sec: any) {
        sec = Number(sec);
        let hours = Math.floor(sec / 3600); // get hours
        let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
        let seconds = sec - (hours * 3600) - (minutes * 60);

        if(hours > 1){
            return (sec/3600).toFixed(2) + " hours"
        }
        else if (hours < 1){
            if(minutes> 1){
                return minutes +" min"
            }
            else{
                return seconds +" secs"
            }
        }
    }

    const duration =secondsToHms(props?.duration)
    return (
        <>
        {duration}
        </>
    )
}

export default TimeDuration