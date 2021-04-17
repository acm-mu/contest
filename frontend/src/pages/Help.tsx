import React, { useState } from "react";
import { Block } from "components";
import { Accordion, AccordionTitleProps, Icon } from 'semantic-ui-react';
import { Helmet } from "react-helmet";

const Help = (): JSX.Element => {

  const [activeIndex, setActiveIndex] = useState<number | string | undefined>(0);

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, { index }: AccordionTitleProps) => setActiveIndex(activeIndex === index ? -1 : index)

  return (
    <>
      <Helmet> <title>Abacus | Help</title> </Helmet>

      <Block size="xs-12">
        <h1>Help Page</h1>
      </Block>

      <Block size="xs-12">
        <h2>Tech Support</h2>
        <h3>Phone: <a href="tel:4143755336">(414) 375-5336</a></h3>
        <h3>Google Meet: <a href="https://meet.google.com/ifq-fcwf-unr">Join Here</a></h3>
      </Block>

      <Block size="xs-12">
        <h2>Frequently Asked Questions</h2>
        <Accordion fluid styled>
          <Accordion.Title
            active={activeIndex === 0}
            index={0}
            onClick={handleClick}
          >
            <Icon name='dropdown' />
          What is Abacus?
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            <p>
              Abacus is a code-execution platform similar to <a href="https://www.algoexpert.io/product" target="_blank" rel="noreferrer">AlgoExpert</a>.
              It was written and developed entirely by student-members of the <a href="https://mu.acm.org" target="_blank" rel="noreferrer">Marquette University ACM Chapter</a> specifically for the
              <a href="https://mu.acm.org/competition" target="_blank" rel="noreferrer"> Wisconsin-Dairyland Programming Competition</a>. The goal was to make a platform-independent web application that would
              allow the entire competition to run virtually as a result of the COVID-19 pandemic.
            </p>
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 1}
            index={1}
            onClick={handleClick}
          >
            <Icon name='dropdown' />
          How does Abacus work?
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            <p>
              Abacus is the hub of the <a href="https://mu.acm.org/competition" target="_blank" rel="noreferrer">Wisconsin-Dairyland Programming Competition</a>. It allows students to upload their solutions
              to contest problems, have them graded, and gain feedback on their submissions. It also allows the students to view the competition problems, see a scoreboard of where
              they are placed at any given point in the competition, and ask questions to judges and other officials about contest problems or individual solutions.
            </p>
            <p>
              Abacus is not just for students! Teachers can also view problems, the competition scoreboard, and other information about the teams competing.
            </p>
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 2}
            index={2}
            onClick={handleClick}
          >
            <Icon name='dropdown' />
          What is required to use the platform?
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            <p>
              We know the accessibility to technology looks different for all competitors. The goal with Abacus was to create a platform that could be accessible
              to all regardless of their technology situation. Any student with a computer, a basic internet connection, and any
              <a href="https://browsehappy.com/" target="_blank" rel="noreferrer"> modern browser</a> can access and use Abacus. There is no
              online code editor built into Abacus, but students can use a platform like <a href="https://www.repl.it" target="_blank" rel="noreferrer">Replit</a>
              , <a href="https://www.jdoodle.com/" target="_blank" rel="noreferrer">JDoodle</a>
              , or <a href="https://www.programiz.com/" target="_blank" rel="noreferrer">Programiz</a>. They will just have to download or copy their code and upload it
              to Abacus for grading. For those who are more comfortable with a native IDE like <a href="https://www.eclipse.org/downloads/"
                target="_blank" rel="noreferrer">Eclipse</a> or <a href="https://www.jetbrains.com/idea/" target="_blank" rel="noreferrer">IntelliJ</a>, that can used
              , too. <b>The only way for code to be submitted is by uploading a file.</b>
            </p>
            <p>
              We have been intentional in the design of Abacus to create a platform that can handle the demand of hundreds of students at a time without the student seeing
              any impact on performance.
            </p>
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 3}
            index={3}
            onClick={handleClick}
          >
            <Icon name='dropdown' />
          How can I get familiar with Abacus before the day of the competition?
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 3}>
            <p>
              We are planning on opening access for students to get familiar with Abacus <b>one week before the competition (April 8, 2021)</b>. During this week, they will be able to
              submit a solution to a practice problem, see how feedback works, and much more.
            </p>
            <p>
              This also allows us to field any comments, questions, or concerns of the competitors or teachers before the competition date. This includes any technical support,
              questions about how to use Abacus, etc.
            </p>
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 4}
            index={4}
            onClick={handleClick}
          >
            <Icon name='dropdown' />
          What happens if I have technical difficulties on the day of the competition?
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 4}>
            <p>
              We will have support staff standing by to help students via <a href="https://meet.google.com/" target="_blank" rel="noreferrer">Google Meet</a>, phone, and email.
            </p>
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 5}
            index={5}
            onClick={handleClick}
          >
            <Icon name='dropdown' />
          As a teacher, can I see all of my teams and their progress?
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 5}>
            <p>
              Yes! On the day of the competition, you can follow the teams from your school on the realtime scoreboard located within each division page.
            </p>
          </Accordion.Content>
        </Accordion>

        <br />
        <p>Have more questions that are not on this page? <a href="mailto:acm-eboard@mscs.mu.edu">Let us know!</a></p>
      </Block>
    </>
  )
};

export default Help;
