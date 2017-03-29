# -*- coding: utf-8 -*-

from flask import url_for


def strip_data(value):
    """Strip leading and trailing spaces"""
    return value.strip() if isinstance(value, str) else value


def url_for_static(*args, **kwargs):
    """Generate url for static resources in short way similar to :func:`flask.url_for`
    """
    if 'filename' not in kwargs and args:
        kwargs['filename'] = args[0]
        args = tuple(args[1:])

    return url_for('static', *args, **kwargs)
