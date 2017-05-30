# -*- coding: utf-8 -*-

import json
import requests

from flask import Response
from flask.views import MethodView

import settings


class BaseApiView(MethodView):
    HEADERS = {settings.PIVOTAL_TRACKER_API_KEY_HEADER: settings.PIVOTAL_TRACKER_API_KEY}

    def make_json_request(self, url, method='GET', headers=None, query_string_data=None, request_data=None):
        """Perform request and return resulting JSON object or `None` if error occurs
        """
        params = {
            'headers': headers or {},
            'data': request_data or {},
            'params': query_string_data or {}
        }

        methods = {
            'GET': requests.get,
            'POST': requests.post
        }

        meth = methods[method]

        resp = meth(url, **params)
        if resp.status_code == 200:
            try:
                return resp.json()
            except:
                pass

        return None

    def response_json(self, success=True, message='', data=None, code=200):
        json_data = json.dumps(
            {'success': success, 'message': message, 'data': {} if data is None else data},
        )

        response = Response(
            json_data,
            status=code,
            mimetype='application/json'
        )

        return response

    def response_ok(self, message='', data=None):
        return self.response_json(success=True, message=message, data=data, code=200)

    def response_fail(self, message='', data=None):
        return self.response_json(success=False, message=message, data=data, code=200)

    def response_error(self, message='', data=None):
        return self.response_json(success=False, message=message, data=data, code=500)


class ProjectsApiView(BaseApiView):
    def get(self):
        """Returns list of project with basic non-calculable information,
            In other words everything that could be received with single request to Pivotal Tracker API
        """
        projects_data = []

        projects = self.make_json_request(settings.PIVOTAL_TRACKER_PROJECTS_ENPOINT, headers=self.HEADERS)
        for project in projects:
            projects_data.append({
                'project_id': project['id'],
                'name': project['name']
            })

        return self.response_ok(data=projects_data)


class EpicsApiView(BaseApiView):
    EPIC_STORIES_DONE = ['unstarted', 'started', 'finished', 'delivered', 'rejected', 'unscheduled']
    EPIC_STORIES = ['unstarted', 'started', 'finished', 'delivered', 'rejected', 'accepted', 'unscheduled']

    RESULT_STORIES_ORDER = ['delivered', 'accepted', 'finished', 'rejected', 'started', 'unstarted', 'unscheduled']

    def get(self, project_id):
        project_data = []

        url = settings.PIVOTAL_TRACKER_EPICS_ENDPOINT.format(project_id=project_id)
        project_epics = sorted(self.make_json_request(url, headers=self.HEADERS) or [], key=lambda x: x['name'])

        print('>> Found {} epics for project {}'.format(len(project_epics), project_id))

        for epic in project_epics:
            url = settings.PIVOTAL_TRACKER_STORIES_ENDPOINT.format(project_id=project_id)
            epic_name = epic.get('label', {}).get('name') or epic['name']
            filters = 'label:"{}" current_state:{}'.format(epic_name, ','.join(self.EPIC_STORIES))
            epic_stories = self.make_json_request(url, query_string_data={'filter': filters}, headers=self.HEADERS)

            print('>> Found {} stories for epic {}, project {}'.format(len(epic_stories), epic['name'], project_id))

            if epic_stories:
                stories_done = [story for story in epic_stories if story.get('current_state') in self.EPIC_STORIES_DONE]

                if stories_done:
                    epic_data = {
                        'name': epic['name'],
                        'total_story_points': sum(story.get('estimate', 0) for story in epic_stories),
                    }

                    def norm(value, max_value=100, to=epic_data['total_story_points']):
                        return round(float(value) * max_value / float(to), 4)

                    epic_data['progress'] = {
                        'value': sum(story.get('estimate', 0) for story in epic_stories),
                        'normalized': None
                    }

                    epic_data['progress']['normalized'] = norm(epic_data['progress']['value'])

                    progress_by_states = {}
                    for story in epic_stories:
                        state, estimate = story['current_state'], story.get('estimate', 0)

                        if state in self.EPIC_STORIES:
                            if state not in progress_by_states:
                                progress_by_states[state] = estimate
                            else:
                                progress_by_states[state] += estimate

                    epic_data['progress_by_states'] = sorted([
                        {'name': k, 'value': v, 'normalized': norm(v)}
                        for k, v in progress_by_states.items()
                    ], key=lambda x: self.RESULT_STORIES_ORDER.index(x['name']))

                    print('Epic data for epic {}, project {}: {}'.format(epic['name'], project_id, epic_data))

                    project_data.append(epic_data)

        return self.response_ok(data=project_data)
