# Pivotal Tracker Projects Dashboard

A dashboard that shows progress and forecasted delivery of epics in pivotal tracker

## MIT License

Copyright (c) 2017 Alex Xela, Matthew Reider

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Deploy via Virtualenv

- clone repository content to a directory
- create virtual environment using Python version 3.5.x and greater
`virtualenv .env` 

- activate virtual environment  
`source .env\bin\activate`

- activate with windows
`.env\Scripts\activate # windows`

- install all required dependencies 
`pip install -r requirements.txt`

- define your personal Pivotal Tracker API key 
`export PIVOTAL_TRACKER_API_KEY=xxx...xxx` 

- define API on Windows
`SET PIVOTAL_TRACKER_API_KEY=xxx...xxx`

- run application
`python run.py`

- run application with gunicorn
`gunicorn --pythonpath . main:flask_app --log-level debug # using gunicorn`

## Deploy via Docker

- Build the image
`docker build -t tracker:latest .`

- Run with tracker env variable
`docker run -e PIVOTAL_TRACKER_API_KEY=8192fdd3944ebceb510c79d2d6 -d -p 5000:5000 tracker`

