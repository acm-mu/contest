import React, { useContext, useEffect, useState } from 'react';
import { Block, Countdown, PageLoading, Unauthorized } from 'components';
import { Helmet } from 'react-helmet';
import { AppContext } from 'context';
import { Divider } from 'semantic-ui-react';
import { Problem } from "abacus";
import config from 'environment';
import MDEditor from '@uiw/react-md-editor';

const Home = (): JSX.Element => {

    const { user, settings } = useContext(AppContext);
    const [isLoading, setLoading] = useState(true)
    const [problem, setProblem] = useState<Problem>();
    const [isMounted, setMounted] = useState(true)

    useEffect(() => {
        loadProblem()
        return () => { setMounted(false) }
    }, []);

    const loadProblem = async () => {
        const response = await fetch(`${config.API_URL}/problems?division=eagle&columns=description`, {
            headers: {
                Authorization: `Bearer ${localStorage.accessToken}`
            }
        })

        if (!isMounted) return

        if (response.ok) {
            const problem = Object.values(await response.json())[0] as Problem
            setProblem(problem)
        }

        setLoading(false)
    }

    const helmet = <Helmet> <title>Abacus | Eagle Problem</title> </Helmet>

    if (isLoading) return <PageLoading />
    if (user?.division != 'eagle' && user?.role != 'admin') return <Unauthorized />

    return (
        <>
            {helmet}
            <Countdown />
            <Block size='xs-12' className='problem'>
                {(!settings || new Date() < settings.start_date) ?
                    <p>The problem cannot be viewed because the competition has not yet started.</p> :
                    (!problem ?
                        <h2>There are no a problems, yet.</h2> :
                        <>
                            <h1>Problem {problem?.id}: {problem?.name}</h1>
                            <Divider />
                            <MDEditor.Markdown source={problem?.description || ''} />
                        </>
                    )}
            </Block>
        </>
    )
}

export default Home;
