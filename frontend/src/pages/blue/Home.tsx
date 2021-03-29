import React from 'react'
import { Block } from 'components'
import java from 'assets/java.png'
import python from 'assets/python.png'
import { Helmet } from 'react-helmet'

const Home = (): JSX.Element => <>
  <Helmet> <title>Abacus | Blue</title> </Helmet>
  <Block size='xs-12'>
    <h1>Blue Division (Java/Python)</h1>

    <div style={{ display: 'flex', justifyContent: 'space-evenly', padding: '15px' }}>
      <img height='175px' src={java} />
      <img height='175px' src={python} />
    </div>

    <p>
      A traditional team-based programming competition, modeled on the ACM International Collegiate Programming Contest.
      Teams of three or four students will have three hours and two computers to work collaboratively to solve problems
      similar in scope to Advanced Placement Computer Science exam questions. Points will be awarded based on the number of
      problems correctly solved and the time taken to solve, with appropriate penalties for incorrect submissions.
    </p>

    <p>
      The International Collegiate Programming Contest is an algorithmic programming contest for college students. Teams of
      three, representing their university, work to solve the most real-world problems, fostering collaboration, creativity,
      innovation, and the ability to perform under pressure. Through training and competition, teams challenge each other to
      raise the bar on the possible. Quite simply, it is the oldest, largest, and most prestigious programming contest in
      the world.
    </p>
  </Block>
</>

export default Home