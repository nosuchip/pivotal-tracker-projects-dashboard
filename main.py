# -*- coding: utf-8 -*-

import filters

from flask import Flask


def init(name):
    app = Flask(name)

    configure_app(app)
    configure_routes(app)

    return app


def configure_app(app):
    app.config.from_object('flask_settings')

    app.jinja_env.globals['url_for_static'] = filters.url_for_static
    app.url_map.strict_slashes = False


def configure_routes(app):
    from views import HomeMethodView
    home_view = HomeMethodView.as_view('views.home')
    app.add_url_rule('/', view_func=home_view, methods=['GET', 'POST'])

    from api import ProjectsApiView
    projects_api = ProjectsApiView.as_view('api.projects')
    app.add_url_rule('/api/projects/', view_func=projects_api, methods=['GET'])

    from api import EpicsApiView
    epics_api = EpicsApiView.as_view('api.epics')
    app.add_url_rule('/api/projects/<project_id>/epics/', view_func=epics_api, methods=['GET'])


flask_app = init(__name__)
