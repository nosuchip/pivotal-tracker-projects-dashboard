To deploy tracker dashboard:

- clone repository content to a directory
- create virtual environment `virtualenv .env` using Python version 3.5.x and greater
- activate virtual environment `source .env\bin\activate` (on Windows use `.env\Scripts\activate`)
- install all required dependencied `pip install -r requirements.txt`
- define your personal Pivotal Tracker API key `export PIVOTAL_TRACKER_API_KEY=xxx...xxx` (on Windows use `SET PIVOTAL_TRACKER_API_KEY=xxx...xxx`) as environment variable
- run application via `python run.py` or using gunicorn: `gunicorn --pythonpath . main:flask_app --log-level debug`
