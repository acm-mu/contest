import React from 'react';
import { Block } from 'components';
import { Helmet } from 'react-helmet';

const About = (): JSX.Element => (
  <>
    <Helmet> <title>Abacus | About</title> </Helmet>

    <Block size="xs-12">
      <h1>About the Marquette ACM/UPE Programming Competition</h1>
    </Block>
    <Block size="xs-12">
      <h2>Overview</h2>
      <p>
        The Wisconsin-Dairyland chapter of the CSTA, in conjunction with the
        Marquette University chapters of ACM and UPE, welcomes high school
        students with Java, Python, or Scratch programming experience to
        participate in a morning of computer science problem solving and/or
        storytelling. This Competition features three divisions:
      </p>

      <h2>Java/Python Division (Blue)</h2>
      <p>
        A traditional team-based programming competition, modeled on the ACM International Collegiate Programming Contest. Teams of three or four students will have three hours and two computers to work collaboratively to solve problems similar in scope to Advanced Placement Computer Science exam questions. Points will be awarded based on the number of problems correctly solved and the time taken to solve, with appropriate penalties for incorrect submissions.
      </p>

      <p>
        The International Collegiate Programming Contest is an algorithmic programming contest for college students. Teams of three, representing their university, work to solve the most real-world problems, fostering collaboration, creativity, innovation, and the ability to perform under pressure. Through training and competition, teams challenge each other to raise the bar on the possible. Quite simply, it is the oldest, largest, and most prestigious programming contest in the world.
      </p>

      <h2>Open/Scratch Division (Gold)</h2>
      <p>
        A team-based programming competition for high school students just beginning their programming education.
        Teams of two or three students will have three hours to work collaboratively to solve problems focused on
        logic, mathematics, and creativity. Points will be awarded based on the number of problems correctly solved
        and original creative ideas. Appropriate penalties will be deducted for incorrect submissions or academic
        dishonesty. Each question is written using <a href="https://scratch.mit.edu/" target="_blank" rel="noreferrer">Scratch</a>,
        an event driven, block-based, visual programming language developed at
        the <a href="https://www.media.mit.edu/" target="_blank" rel="noreferrer">MIT Media Lab</a> at the Massachusetts Institute of Technology.
      </p>

      <h2>AP Computer Science Principles (Eagle)</h2>
      <p>
        Teams of two to four students will be working together to solve a problem
        that is present in society and is awaiting a technological solution.
        The students then have three hours to develop a solution using their knowledge
        of computer science principles and technologies. Students are required to
        write some code/create a working prototype. We are not expecting a flushed
        out UI, but a program of some sort that accomplishes their implementation/solution
        to the problem is what we are aiming for. At the end of the three hours,
        each team will present (5 – 10 minutes) their solution to a small board of faculty and/or student
        members. The board will ask a few questions and ultimately vote on a winner. We
        will have a Google Meet call where students will present and gain the feedback mentioned earlier.
      </p>
    </Block>
  </>
)

export default About;
