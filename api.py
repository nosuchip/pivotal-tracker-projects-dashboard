# -*- coding: utf-8 -*-

import json
import requests

# REMOVE: Next 2 lines is for mock data only
from datetime import datetime, timedelta
import random

from flask import Response, url_for
from flask.views import MethodView

import settings


class BaseApiView(MethodView):
    HEADERS = {settings.PIVOTAL_TRACKER_API_KEY_HEADER: settings.PIVOTAL_TRACKER_API_KEY}

    def response_json(self, success=True, message='', data=None, code=200):
        json_data = json.dumps(
            {'success': success, 'message': message, 'data': data or {}},
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
    def _get_epics(self, project_id):
        epics = []
        url = settings.PIVOTAL_TRACKER_EPICS_ENDPOINT.format(project_id=project_id)

        resp = requests.get(url, headers=self.HEADERS)

        if resp.status_code == 200:
            try:
                jsn = resp.json()

                for epic_json in jsn:
                    epics.append({
                        'epic_id': epic_json['id'],
                        'name': epic_json['name'],
                        'project_id': epic_json['project_id'],
                        'pivotal_url': epic_json['url'],
                        'url': url_for('api.epics', project_id=project_id, epic_id=epic_json['id'])
                    })
            except:
                print('Unable to decode epics json while response code is 200')

        return epics

    def get(self):
        """Returns list of project with basic non-calculable information,
            In other words everything that could be received with single request to Pivotal Tracker API
        """

        # TODO: Call Pivotal Tracker API for project info
        resp = requests.get(settings.PIVOTAL_TRACKER_PROJECTS_ENPOINT, headers=self.HEADERS)

        if resp.status_code == 200:
            jsn = resp.json()

            projects = []

            for project_json in jsn:
                project = {
                    'project_id': project_json['id'],
                    'name': project_json['name'],
                    'epics': self._get_epics(project_json['id'])
                }

                projects.append(project)

            return self.response_ok(data={'projects': projects})

        return self.response_fail(message='No projects found')


class EpicsApiView(BaseApiView):
    def get(self, project_id, epic_id):
        """Returns comprehensive information about single epic
           - delivery date
           - total points
           - current progress
        """

        # TODO: Call Pivotal Tracker API for project info
        # resp = requests.get()

        epic = {}

        resp = requests.get(settings.PIVOTAL_TRACKER_EPIC_ENDPOINT, headers=self.HEADERS)
        if resp.status_code == 200:
            jsn = resp.json()
            epic.update({
                'name': jsn['name'],
                'project_id': jsn['project_id'],
                'epic_id': jsn['id']
            })

            mock_delivery_date = datetime.utcnow() + timedelta(days=15)
            mock_story_points = random.randrange(20, 40)
            mock_progress = random.randrange(mock_story_points//2, mock_story_points)

            epic.update({
                'delivery_date': mock_delivery_date.strftime('%Y-%m-%d'),
                'story_points': mock_story_points,
                'progress': mock_progress
            })

            return self.response_ok(data=epic)

        return self.response_fail(message='Project not found')
