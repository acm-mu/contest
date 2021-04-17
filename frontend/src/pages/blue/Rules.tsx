import React, { useContext } from 'react'
import { Block } from 'components'
import { Helmet } from 'react-helmet'
import { Divider } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { AppContext } from 'context'

const Rules = (): JSX.Element => {

    const { user } = useContext(AppContext);
    const { settings } = useContext(AppContext)

    const isBeforeCompetition = () => !settings || new Date() < settings.start_date
    const hasAccessTo = () => user?.role == 'admin' || user?.division == 'blue'

    return <>
        <Helmet> <title>Abacus | Blue Rules</title> </Helmet>
        <Block size='xs-12'>
            <h1>Rules</h1>
            <p><em><b>
                Please read over these rules, in their entirety, before beginning the competition.
                We assume that a submission of a problem is an acceptance to adhere to these rules.
        </b></em></p>

            <Divider />

            <h2>Permitted Materials</h2>
            <p>
                The following is a list of permitted materials for use within the time of the competition.
        </p>
            <ul>
                <li>The <a href="https://docs.oracle.com/javase/7/docs/api/" target="_blank" rel="noreferrer">Java API Documentation</a> and <a href="https://docs.python.org/3/library/" target="_blank" rel="noreferrer">Python API Documentation</a></li>
                <li>Our competition website, <a href="https://codeabac.us" target="_blank" rel="noreferrer">Abacus</a></li>
                <li>Your IDE&apos;s documentation</li>
                <li>Blank paper and writing utensils</li>
            </ul>

            <Divider />

            <h2><b>Non</b>-Permitted Materials</h2>
            <p>
                The following is a list of <em><b>non</b></em>-permitted materials. <b>This list is not comprehensive.</b>
            </p>
            <ul>
                <li><b>NO</b> other websites. This includes but is not limited to:</li>
                <ul>
                    <li>StackOverflow</li>
                    <li>StackExchange</li>
                    <li>Reddit</li>
                    <li>GeeksToGeeks</li>
                    <li>or any other programming self-help website</li>
                </ul>
                <li><b>NO</b> pre-prepared solutions. This means no boilerplate code or any code that was prepared prior to the start of the competition</li>
            </ul>

            <h3><b>
                Marquette ACM adopts a zero tolerance policy when it comes to cheating.
                If you are caught violating any of the rules, your team will be removed and disqualified from the competition without a refund.
        </b></h3>

            <Divider />

            <h2>Scoring</h2>
            <p>
                Teams are ranked by the number of problems correctly solved. Try to solve as many problems as possible.
        </p>
            <p>
                To break ties, there is an additional &quot;penalty&quot; score. Here&apos;s an explanation:
        </p>
            <ul>
                <li>When you correctly solve a problem, one &quot;penalty&quot; point is added per minute since the start of the competition.</li>
                <ul>
                    <li><em>Ex:</em> If you correctly solve the first question 35 minutes into the competition,
                you will also earn 35 &quot;penalty&quot; points. This means solving questions more quickly is better.</li>
                </ul>
                <li>If you submit an incorrect solution, 20 &quot;penalty&quot; points are added to your score for that problem.
                Try not to make too many incorrect submissions.</li>
            </ul>

            <Divider />

            <h2>Competition Guidelines</h2>
            <p>
                Here are some other general guidelines that you might find useful:
            </p>
            <ul>
                <li>There are no restrictions on the number of computers or devices you can use.</li>
                <li>You <b>may</b> use online communication software like email, Zoom, Teams, Skype, Discord, etc. for communication <b>solely between</b> you and your teammates.</li>
                <li>Your solutions have a runtime limit of <b>30 seconds</b>. When judging, solutions are stopped if they take longer than 30 seconds to execute.</li>
                <li>Ask questions regarding logistics and problems to the judges. This includes:</li>
                <ul>
                    <li>Questions regarding the rules of the competition</li>
                    <li>Questions regarding how to use the competition website, Abacus</li>
                    <li>Questions regarding any confusing parts of the competition problems</li>
                </ul>
                <p>These questions can be asked through the {hasAccessTo() ? <Link to={'/blue/clarifications'}>Clarifications</Link> : 'Clarifications'} tab.</p>
                <li>For issues with technology, feel free to reach out to our tech support staff online using {isBeforeCompetition() ? <a href="https://meet.google.com/ifq-fcwf-unr" target="_blank" rel="noreferrer">Google Meet</a> : <a href="#">Google Meet</a>} or,
                if your internet is not working, by phone at <a href={isBeforeCompetition() ? "tel:4143755336" : "#"}>(414) 375-5336</a>.</li>
            </ul>

            <Divider />

            <h2>Other Notes</h2>
            <p>
                Some finals things to take note of:
            </p>
            <ul>
                <li>The competition problems have <b>strict input and output formatting requirements</b>. Input and output should match exactly as they appear
                in the problem descriptions.</li>
                <ul>
                    <li><b>We highly recommend the use of the &quot;Skeletons&quot;, which can be found on each problem page underneath the
                        &quot;Submit&quot; and &quot;Ask&quot; buttons.</b></li>
                </ul>
                <li>Submit your source code file (<code>.java</code> or <code>.py</code>). <b>Do not</b> submit <code>.class</code> or <code>.pyc</code> files.</li>
                <li>If writing your submission in Java, do not use packages. Remove any <code>package...</code> statements from the top of your Java solution
                source code file before submitting.</li>
            </ul>

            <p>That is all! Thank you for taking the time to read the rules and happy programming!</p>

        </Block>
    </>
}
export default Rules