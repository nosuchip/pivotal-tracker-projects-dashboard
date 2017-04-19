# -*- coding: utf-8 -*-

import os

SECRET_KEY = '18144a6dbe324f818330abacb63317471a92986728de4499abf5a74941dc6fdd'
DEBUG = os.getenv('DEBUG') == '1'
USE_MOCK_DATA = os.getenv('USE_MOCK_DATA') == '1'
