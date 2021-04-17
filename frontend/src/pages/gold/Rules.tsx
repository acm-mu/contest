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
    const hasAccessTo = () => user?.role == 'admin' || user?.division == 'gold'

    return <>
        <Helmet> <title>Abacus | Gold Rules</title> </Helmet>
        <Block size='xs-12'>
            <h1>Rules</h1>
            <p><em><b>
                Please read over these rules, in their entirety, before beginning the competition.
                We assume that a submission of a problem is an acceptance to adhere to these rules.
        </b></em></p>

            <Divider />

            <h2>Competition Rules</h2>
            <p>
                The following is a list of rules regarding what you can and cannot do during the competition:
        </p>
            <ul>
                <li>You <b>may</b> use outside sources (the internet, image editing tools, etc.) to create sprites, sounds, and other materials for your project.</li>
                <li>You <b>may <em>not</em></b> take code from public projects on the Scratch website, or projects you have worked on outside of the competition.</li>
                <li>You <b>may <em>not</em></b> collaborate with other teams, even teams from your own school; sharing materials or discussing the problems with other teams is strictly prohibited.</li>
                <li>You <b>may</b> use online communication software like email, Zoom, Teams, Skype, Discord, etc. for communication solely between you and your teammates.</li>
                <li>There are no restrictions on the number of computers or devices you can use.</li>
            </ul>
            <p>
                If you are unsure if a specific outside source is permitted, do not hesitate to submit a {hasAccessTo() ? <Link to={'/gold/clarifications'}>Clarification</Link> : 'Clarification'} to the judges. Judges may also request that you stop using a specific website or device if they suspect it is being used to break the rules of the competition.
            </p>

            <h3><b>
                Marquette ACM adopts a zero tolerance policy when it comes to cheating.
                If you are caught violating any of the rules, your team will be removed and disqualified from the competition without a refund.
        </b></h3>

            <Divider />

            <h2>Grading</h2>
            <p>
                Grading can be somewhat complex. Here is a breakdown of how it works:
            </p>
            <ul>
                <li>The first three <b>Technical Problems</b> have a total of <b>19</b> points for the technical section.</li>
                <ul>
                    <li>Points are awarded for how many of the problem requirements were fulfilled, and how well they were fulfilled. Judge feedback will specifically address which features you are receiving credit for, and which you are not. Partial credit will be awarded; see the rubric for the possible points per problem. You do not need to work in order of the feature list.</li>
                </ul>
                <li>Two <b>Creative Problems</b> have a possible <b>15</b> points each to earn, but the creative section is capped at 20 total points.</li>
                <ul>
                    <li>On one hand, you could balance your effort between the two problems to try to earn 10 points on each. Alternatively, you could go all out on one problem to earn 15 points, and only need to earn 5 points on the other to get maximum credit.</li>
                    <li><b>For this section, in addition to submitting your Scratch project file, you will need to submit a short &quot;design document&quot; (there is a text editor on Abacus) listing the features you created for your project.</b></li>
                    <li>Since the creative section is very open-ended, this design document lets you &quot;sell&quot; your solution to the judges. These problems can take a lot of work, so brag about your favorite features of your solution; make sure none of them are overlooked!</li>
                    <li>Points are awarded for how well the solution fits the problem&apos;s prompt, and the quantity and quality of the features included and listed in the design document.</li>
                </ul>
            </ul>

            <Divider />

            <h2>Submission Policies</h2>
            <p>
                Grading can be somewhat complex. Here is a breakdown of how it works:
            </p>
            <ul>
                <li>Try to score as many points as possible. You don’t have to attempt every problem.</li>
                <li>Submit your solution as soon as it is ready - don’t wait to submit all your solutions at the end. Judges will give feedback on your solutions throughout the competition.</li>
                <li>There is not a penalty for re-submitting to a problem. You can improve your solution according to judge feedback and re-submit to earn more points.</li>
                <li>Do not submit the same solution twice. <b>Only re-submit to a problem if you have changed your solution.</b></li>
            </ul>

            <p>For issues with technology, feel free to reach out to our tech support staff online using {isBeforeCompetition() ? <a href="https://meet.google.com/ifq-fcwf-unr" target="_blank" rel="noreferrer">Google Meet</a> : <a href="#">Google Meet</a>} or,
                if your internet is not working, by phone at <a href={isBeforeCompetition() ? "tel:4143755336" : "#"}>(414) 375-5336</a>.</p>
            <p>That is all! Thank you for taking the time to read the rules and happy programming!</p>

        </Block>
    </>
}
export default Rules