const AWS = require("aws-sdk");
const axios = require("axios");

const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async(event) => {
    const submissions = {};
    for (const record of event.Records) {
        // Only run for new items
        if (record.eventName != "INSERT") continue;

        // Find submission from event metadata
        const submission = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
        const { sid, pid, division } = submission;

        if (division !== 'blue') continue

        // Get problem and competition details
        const problem = await getItem('problem', { pid })
        const settings = Object.assign({}, ...(await scanItems('setting')).map(((x) => ({
            [x.key]: x.value
        }))));

        // Update status to 'pending'
        await updateItem('submission', { sid }, { status: 'pending' });

        // Extract details and set defaults
        const { language, source, date: submission_date } = submission;
        let status = "accepted";
        let runtime = -1;

        // Copy tests from problem
        submission.tests = problem.tests;

        // Run tests
        for (const test of submission.tests) {
            // Await response from piston execution
            const res = await axios.post("https://piston.codeabac.us/execute", {
                language,
                source,
                stdin: test.in
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            runtime = Math.max(runtime, res.data.runtime);
            test.stdout = res.data.output;

            if (res.data.output != test.out) {
                console.log("Result: REJECTED");
                status = "rejected";
                test['result'] = "rejected";
            } else {
                console.log("Result: ACCEPTED");
                test['result'] = "accepted";
            }
        }

        submission.status = status
        submission.runtime = runtime

        // Calculate Score
        if (status == "accepted") {
            let { start_date, points_per_no, points_per_yes, points_per_minute } = settings;
            if (problem.practice) {
                start_date = settings.practice_start_date
            }
            const minutes = (submission_date - start_date) / 60;

            submission.score = Math.floor((minutes * points_per_minute) + (points_per_no * submission.sub_no) + points_per_yes);
        } else {
            submission.score = 0;
        }

        // Save submission to database
        await updateItem('submission', { sid }, {...submission });

        submissions[sid] = submission;
    }

    return { statusCode: 200, submissions };
};

function scanItems(tableName) {
    return new Promise((resolve, reject) => {
        db.scan({
            TableName: tableName
        }, (err, data) => {
            if (err) reject(err);
            else resolve(data.Items);
        });
    });
}

function getItem(tableName, key) {
    return new Promise((resolve, reject) => {
        db.get({
            TableName: tableName,
            Key: key
        }, (err, data) => {
            if (err) reject(err);
            else resolve(data.Item);
        });
    });
}

function updateItem(tableName, key, args) {
    return new Promise((resolve, reject) => {
        const entries = Object.entries(args).filter(entry => !Object.keys(key).includes(entry[0]));
        db.update({
            TableName: tableName,
            Key: key,
            UpdateExpression: "SET " + (entries.map((e) => (`#${e[0]} = :${e[0]}`)).join(", ")),
            ExpressionAttributeNames: Object.assign({}, ...entries.map((x) => ({
                [`#${x[0]}`]: x[0]
            }))),
            ExpressionAttributeValues: Object.assign({}, ...entries.map((x) => ({
                [`:${x[0]}`]: x[1]
            })))
        }, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}