import React, { useState, useContext, useEffect } from "react";
import { Loader } from "semantic-ui-react";
import Moment from "react-moment";
import { Block, FlipClock } from "components";
import { AppContext } from "context";

import "./Countdown.scss";

const Countdown = (): JSX.Element => {
  const { settings } = useContext(AppContext)
  const [time, setTime] = useState<Date>(new Date())
  const [isMounted, setMounted] = useState(true)

  const diff = (date1: Date, date2: Date) => date1.getTime() - date2.getTime();

  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (isMounted) {
        setTime(new Date());
      }
    }, 200);

    return () => {
      clearInterval(updateInterval)
      setMounted(false)
    }
  }, [])

  if (!settings) return <Loader active inline='centered' content="Loading" />

  const { practice_start_date: pstart, practice_end_date: pend, start_date: start, end_date: end } = settings

  let competition_name = settings?.competition_name

  const inPractice = time > pstart && time < pend
  const inCompetition = time > start && time < end
  const isCountingDown = !inPractice && !inCompetition && !(time > end)

  const countdownTo = time < settings.practice_start_date ? settings.practice_start_date : settings.start_date
  let startDate = settings.start_date
  let endDate = settings.end_date

  if (inPractice) {
    competition_name = settings.practice_name
    startDate = pstart
    endDate = pend
  }

  return (
    <Block size='xs-12'>
      {isCountingDown ?
        <>
          <h1>{competition_name}</h1>
          <FlipClock count_to={countdownTo} />
        </> :
        <>
          <div className="upper">
            <p>
              <b>Start</b> <Moment date={startDate} format="MM/DD/YYYY, hh:mm:ss A" />
            </p>
            <h1>{competition_name}</h1>
            <p>
              <b>End</b> <Moment date={endDate} format="MM/DD/YYYY, hh:mm:ss A" />
            </p>
          </div>

          <div className="countdown">
            <div
              className="progress_bar"
              style={{
                width: `${Math.min(diff(time, startDate) / diff(endDate, startDate), 1) * 100}%`
              }}
            />
          </div>

          <div className="lower">
            <p>
              <b>Time elapsed </b>
              {endDate > time ?
                <Moment format="H:mm:ss" date={startDate} durationFromNow />
                : <Moment format="H:mm:ss" duration={startDate} date={endDate} />}
            </p>
            <p>
              <b>Time remaining </b>
              {endDate > time ?
                <Moment format="H:mm:ss" duration={time} date={endDate} />
                : "Finished"}
            </p>
          </div>
        </>
      }
    </Block>
  );
};

export default Countdown;
