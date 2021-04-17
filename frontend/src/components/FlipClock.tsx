import React, { useState } from 'react'
import "./FlipClock.scss"

// Calculation adapted from https://www.sitepoint.com/build-javascript-countdown-timer-no-dependencies/

const thirtyOneDays = [0, 2, 4, 6, 7, 9, 11] // January, March, May, July, August, October, December

function timeRemaining(endtime: Date) {
  const now = new Date()
  let t = endtime.getTime() - now.getTime()
  const months = ((endtime.getMonth() - now.getMonth()) + 12) % 12
  // if (endtime.getDate() <= now.getDate()) months--
  if (months > 0) {
    let deltaDays = 0
    for (let i = 0; i < months; i++) {
      let month = ((new Date()).getMonth() + i) % 12
      if (month == 1) deltaDays += 28 // February
      else if (thirtyOneDays.includes(month)) deltaDays += 31
      else deltaDays += 30
      month = (month + 1) % 12
    }
    t -= deltaDays * (1000 * 60 * 60 * 24)
  }
  return {
    'Total': endtime.getTime() - Date.now(),
    'Months': months,
    'Days': Math.floor(t / (1000 * 60 * 60 * 24)),
    'Hours': Math.floor((t / (1000 * 60 * 60)) % 24),
    'Minutes': Math.floor((t / 1000 / 60) % 60),
    'Seconds': Math.floor((t / 1000) % 60)
  }
}

const FlipClock = (props: { count_to: Date }): JSX.Element => {
  const [flip, setFlip] = useState('');

  return (
    <div className='flip-clock'>
      {Object.entries(timeRemaining(props.count_to)).map(([label, value]) => {
        const val = ('0' + value).slice(-2)
        return (
          label !== 'Total' ?
            <React.Fragment key={`fp-${label}`} >
              <span onAnimationStart={() => setFlip('flip')} onAnimationEnd={() => setFlip('')} className={`flip-clock__piece ${flip} `}>
                <b className="flip-clock__card card">
                  <b className="card__top">{val}</b>
                  <b className="card__bottom" data-value={val} />
                  <b className="card__back" data-value={val}>
                    <b className="card__bottom" data-value={val} />
                  </b>
                </b>
                <span className="flip-clock__slot">{label}</span>
              </span>
            </React.Fragment>
            : <React.Fragment key={`fp-${label}`}></React.Fragment>
        )
      })}
    </div>
  )
}

export default FlipClock