import React from 'react';
import { Block } from 'components';
import { Helmet } from 'react-helmet';

const Home = (): JSX.Element => {

    const helmet = <Helmet> <title>Abacus | Eagle Division</title> </Helmet>

    return (
        <>
            {helmet}
            <Block size="xs-12">
                <h1>Eagle Division</h1>
                <h2>Overview</h2>
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
}

export default Home;
