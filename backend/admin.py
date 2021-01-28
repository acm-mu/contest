from flask import Blueprint, render_template, redirect
import json
from contest import contest
from authlib import login_required

admin = Blueprint('admin_bp', __name__, url_prefix='/admin',
                  template_folder='templates')


@admin.route('/')
@login_required('admin')
def index():
    return render_template('admin/index.html')


@admin.route('/users')
@login_required('admin')
def teams():
    return render_template('admin/users.html', users=contest.get_users())


@admin.route('/settings')
@login_required('admin')
def settings():
    return render_template('admin/settings.html', settings=contest.get_settings())


@admin.route('/submissions')
@login_required('admin')
def submissions():
    submissions = contest.get_submissions()
    for submission in submissions:
        submission['team_name'] = contest.get_users(
            user_id=submission['team_id'])[0]['user_name']
        problem = contest.get_problems(problem_id=submission['problem_id'])[0]
        submission['prob_name'] = problem['problem_name']

    submissions = sorted(
        submissions, key=lambda obj: obj['date'], reverse=True)
    return render_template('admin/submissions.html', submissions=submissions)


@admin.route('/submissions/<sid>')
@login_required('admin')
def submission(sid):
    submissions = contest.get_submissions(submission_id=sid)
    if not submissions:
        return render_template('404.html')
    submission = submissions[0]
    contents = contest.s3.Bucket('abacus-submissions').Object(
        f"{ submission['submission_id'] }/{ submission['filename'] }").get()['Body'].read().decode()
    filename = submission['filename']
    problem = contest.get_problems(problem_id = submission['problem_id'])[0]
    submission['prob_id'] = problem['id']
    submission['prob_name'] = problem['problem_name']
    submission['team_name'] = contest.get_users(
            user_id=submission['team_id'])[0]['user_name']
    return render_template('admin/submission.html', submission=submission, filename=filename, contents=contents)


@admin.route('/submissions/<sid>/invoke')
@login_required('admin')
def invoke_submission(sid):
    submission = contest.get_submissions(submission_id = sid)[0]
    filename = submission['filename'] if submission[
        'language'] == "Python 3" else f"{submission['filename'][:-5]}.class"
    payload = {
        'Records': [
            {
                's3': {
                    'bucket': {
                        "name": "abacus-submissions"
                    },
                    "object": {
                        "key": f"{sid}/{filename}"
                    }
                }
            }
        ]
    }

    contest.lmbda.invoke(
        FunctionName='BlueRunner',
        InvocationType='Event',
        Payload=json.dumps(payload).encode()
    )
    return redirect(f"/admin/submissions/{sid}")


@admin.route('/clarifications')
@login_required('admin')
def clarifications():
    return render_template('admin/clarifications.html')


@admin.route('/problems')
@login_required('admin')
def problems():
    problems = contest.get_problems()
    problems = sorted(problems, key=lambda prob: prob['id'])
    return render_template('admin/problems.html', problems=problems)


@admin.route('/problems/<pid>/edit')
@login_required('admin')
def edit_problem(pid):
    problems = contest.get_problems(problem_id = pid)
    if not problems:
        return render_template('404.html')
    return render_template('admin/edit_problem.html', problem=problems[0])


@admin.route('/problems/new')
@login_required('admin')
def new_problem():
    return render_template('admin/new_problem.html')