import React from 'react'
import { Block } from '../../components'

const Home = (): JSX.Element => (
  <Block size='xs-12'>
    <h1>Blue Division (Java/Python)</h1>

    <div style={{ display: 'flex', justifyContent: 'space-evenly', padding: '15px' }}>
      <img style={{ height: '175px' }} src='https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Flogos-download.com%2Fwp-content%2Fuploads%2F2016%2F10%2FJava_logo.png&f=1&nofb=1' />
      <img style={{ height: '175px' }} src='https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Flogodownload.org%2Fwp-content%2Fuploads%2F2019%2F10%2Fpython-logo.png&f=1&nofb=1' />
    </div>

    <p>A traditional team-based programming competition, modeled on the ACM International Collegiate Programming Contest.
    Teams of three or four students will have three hours and two computers to work collaboratively to solve problems
    similar in scope to Advanced Placement Computer Science exam questions. Points will be awarded based on the number of
    problems correctly solved and the time taken to solve, with appropriate penalties for incorrect submissions.
    Development environments available will most likely include Eclipse, NetBeans, WordPad + JDK, Cygwin tools, BlueJ, and
    IntelliJ. You may find it useful to review our Competition Rules, and Java Preparation Notes (Python Preparation Notes
  coming soon).</p>

    <p>The International Collegiate Programming Contest is an algorithmic programming contest for college students. Teams of
    three, representing their university, work to solve the most real-world problems, fostering collaboration, creativity,
    innovation, and the ability to perform under pressure. Through training and competition, teams challenge each other to
    raise the bar on the possible. Quite simply, it is the oldest, largest, and most prestigious programming contest in
  the world.</p>
  </Block>
)

export default Home