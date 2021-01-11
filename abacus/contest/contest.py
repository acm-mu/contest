import os
import hashlib
import time
import hashlib
import uuid
from flask import session
from boto3.session import Session
from boto3.dynamodb.conditions import Attr


class ContestService:

    def __init__(self):
        self.init_aws()

    def init_aws(self):
        r""" Connects application to AWS."""
        aws_access_key = os.environ.get('AWS_ACCESS_KEY', None)
        aws_secret_key = os.environ.get('AWS_SECRET_KEY', None)

        # if not aws_access_key or not aws_secret_key:
        #     self.db = self.s3 = None

        self.aws = Session(
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
            region_name="us-east-2")

        self.db = self.aws.resource('dynamodb')
        self.s3 = self.aws.resource('s3')
        self.lmbda = self.aws.client('lambda')

    def auth_login(self, form_data: dict) -> bool:
        m = hashlib.sha256()
        m.update(form_data['password'].encode())
        password = m.hexdigest()

        for user in self.get_users():
            if user['user_name'] == form_data['user-name']:
                if user['password'] == password:
                    session['session_token'] = uuid.uuid4().hex

                    self.db.Table('user').update_item(
                        Key={'user_id': user['user_id']},
                        UpdateExpression=f"SET session_token = :session_token",
                        ExpressionAttributeValues={':session_token': session['session_token']})
                    return True

        return False

    def is_logged_in(self) -> bool:
        if 'session_token' in session:
            user = self.db.Table('user').scan(
                FilterExpression = Attr('session_token').eq(session['session_token'])
            )['Items']
            if user:
                return True
        return False

    def is_judge(self) -> bool:
        if self.is_logged_in():
            return self.getuserinfo('role') == "judge"
        return False

    def is_admin(self) -> bool:
        if self.is_logged_in():
            return self.getuserinfo('role') == 'admin'
        return False

    def home(self) -> str:
        if self.is_logged_in():
            return f"/{self.getuserinfo('division')}"

        if self.getuserinfo('role') == 'admin':
            return '/admin'

        return '/'

    def get_settings(self) -> dict:
        settings = self.db.Table('setting').scan()['Items']
        return {s['key']: s['value'] for s in settings}

    def save_settings(self, settings: dict):
        """ Uploads updated settings to DynamoDB.

        Args:
            settings: dictionary object containing all settings
        """
        with self.db.Table('setting').batch_writer() as batch:
            for key, value in settings.items():
                batch.put_item(
                    Item={
                        'key': key,
                        'value': value
                    })

    def get_problems(self, sort_key = 'id', **filters) -> list:
        r"""Retrieves problems from DynamoDB.

        Args:
            filters: Arbitrary kword arguments to use as filters for database scan.

        Returns:
            A list of problem object dictionaries or an empty list if no problems match filters.
         """
        filter_expression = " AND ".join(
            f"#{key} = :{key}" for key in filters.keys())
        names = {f"#{key}": key for key in filters.keys()}
        values = {f":{key}": value for key, value in filters.items()}

        if not filters:
            return self.db.Table('problem').scan()['Items']

        problems = self.db.Table('problem').scan(
            FilterExpression=filter_expression,
            ExpressionAttributeValues=values,
            ExpressionAttributeNames=names)['Items']
        
        return sorted(problems, key = lambda row: row[sort_key])

    def get_submissions(self, **filters) -> list:
        r"""Retrieves submissions from DynamoDB.

        Args:
            filters: Arbitrary kword arguments to use as filters for database scan.

        Returns:
            A list of submission object dictionaries or an empty list if no submissions match filters.
        """
        if not filters:
            return self.db.Table('submission').scan()['Items']

        filter_expression = " AND ".join(
            f"#{key} = :{key}" for key in filters.keys())
        names = {f"#{key}": key for key in filters.keys()}
        values = {f":{key}": value for key, value in filters.items()}

        return self.db.Table('submission').scan(
            FilterExpression=filter_expression,
            ExpressionAttributeValues=values,
            ExpressionAttributeNames=names)['Items']

    def getuserinfo(self, attr) -> object:
        users = self.get_users(session_token=session['session_token'])
        if users and attr in users[0]:
            return users[0][attr]
        return None

    def get_users(self, **filters) -> list:
        r"""Retrieves users from DynamoDB.

        Args:
            filters: Arbitrary kword arguments to use as filters for database scan.

        Returns:
            A list of user object dictionaries or an empty list if no users match filters.

        Example:
            >>> contest.get_users(role = 'team')
        """
        if not filters:
            return self.db.Table('user').scan()['Items']

        filter_expression = " AND ".join(
            f"#{key} = :{key}" for key in filters.keys())
        names = {f"#{key}": key for key in filters.keys()}
        values = {f":{key}": value for key, value in filters.items()}

        return self.db.Table('user').scan(
            FilterExpression=filter_expression,
            ExpressionAttributeValues=values,
            ExpressionAttributeNames=names)['Items']

    def import_users(self, file, replace: bool = False):
        return
        # lines = [line.decode('utf-8-sig') for line in file.readlines()]
        # for i in range(len(lines)):
        #     items = split_csv(lines[i])

    def submit(self, request) -> dict:
        language = request.form['language']
        submission_id = uuid.uuid4().hex

        problem_id = request.form['problem-id']
        print(problem_id, flush=True)
        
        problem = self.get_problems(problem_id=problem_id)[0]

        sub_no = len([sub for sub in self.get_submissions(team_id=self.getuserinfo('user_id'), problem_id=problem_id)])

        item = {
            'submission_id': submission_id,
            'sub_no': sub_no,
            'status': "pending",
            'score': 0,
            'date': int(time.time()),
            'language': language,
            'problem_id': problem_id,
            'team_id': self.getuserinfo('user_id')
        }

        if language == "scratch":
            item['filename'] = request.form['scratch_url']
        else:
            sub_file = request.files['sub-file']

            # Upload file to AWS S3 Bucket
            key = f"{ submission_id }/{ sub_file.filename }"
            self.s3.Bucket('abacus-submissions').upload_fileobj(sub_file, key)
            obj = self.s3.Bucket('abacus-submissions').Object(key).get()['Body']

            # Generate sha1 hash for file
            h = hashlib.sha1()
            h.update(obj.read())

            file_size = self.s3.ObjectSummary('abacus-submissions', key).size

            item['filename'] = sub_file.filename
            item['runtime'] = 0
            item['filesize'] = file_size
            item['sha1sum'] = h.hexdigest()
            item['tests'] = problem['tests']

        self.db.Table('submission').put_item(
            Item=item
        )

        return item
    
    def get_standings(self, division):
        standings = self.get_users(division=division, role='team')
        problems = self.get_problems(division=division)
        for team in standings:
            del team['session_token']
            team['problems'] = {}
            total_score = 0
            solved = 0
            for problem in problems:
                problem_score = 0
                submissions = contest.get_submissions(team_id = team['user_id'], problem_id = problem['problem_id'])
                for submission in submissions:
                    if submission['score'] != 0:
                        problem_score = submission['score']
                        total_score += submission['score']
                        break
                team['problems'][problem['id']] = {
                    'solved': problem_score != 0,
                    'problem_score': problem_score,
                    'num_submissions': len(submissions),
                    'submissions': submissions
                }
                if problem_score != 0:
                    solved += 1

            team['solved'] = solved
            team['time'] = total_score
        return sorted(standings, key = lambda team: team['solved'], reverse=True)


contest: ContestService = ContestService()
