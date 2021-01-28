import React from "react";
import DefaultNavigation from "./DefaultNavigation";
import { Container } from "semantic-ui-react";
import { Block } from "../components";

const About = (): JSX.Element => (
  <>
    <DefaultNavigation />
    <Container text className="main">
      <Block size='xs-12'>
        <h1>Marquette ACM / UPE Programming Competition</h1>
      </Block>
      <Block size='xs-12'>
        <h1>Overview</h1>
        <p>
          {" "}
          The Wisconsin-Dairyland chapter of the CSTA, in conjunction with the
          Marquette University chapters of ACM and UPE, welcomes high school
          students with Java, Python or Scratch programming experience to
          participate in a morning of computer science problem solving and/or
          storytelling. This Competition features three divisions:
        </p>
        <h1>Java/Python Division (Blue)</h1>

        <p>
          A traditional team-based programming competition, modeled on the ACM
          International Collegiate Programming Contest. Teams of three or four
          students will have three hours and two computers to work
          collaboratively to solve problems similar in scope to Advanced
          Placement Computer Science exam questions. Points will be awarded
          based on the number of problems correctly solved and the time taken to
          solve, with appropriate penalties for incorrect submissions.
          Development environments available will most likely include Eclipse,
          NetBeans, WordPad + JDK, Cygwin tools, BlueJ, and IntelliJ. You may
          find it useful to review our Competition Rules, and Java Preparation
          Notes (Python Preparation Notes coming soon).
        </p>

        <h1>Open/Scratch Division (Gold)</h1>

        <p>
          Teams of two or three students will have three hours and one computer
          to implement a themed Scratch project. Submissions will be judged on
          creativity, use of key Scratch constructs, and theme correspondence.
          This division will be suitable for introductory students familiar with
          Scratch.
        </p>
        <h1>AP Computer Science Principles (Eagle)</h1>

        <p>
          Teams of two or three students will be working together to solve
          challenges and present their results, similar to the concepts tested
          in the AP Computer Science Principles exam. (If you sign up for this
          division, we will email you by the first week of March with more
          details about this division).
        </p>
      </Block>
    </Container>
  </>
);

export default About;
