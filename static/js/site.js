Handlebars.registerHelper('renderTemplate', function(templateId, context, options) {
    try {
        context = JSON.parse(context);
    } catch(e) {}

    return new Handlebars.SafeString(Pivotal.Templates.renderTemplate(templateId, context));
});

this.Pivotal = this.Pivotal || {};

Pivotal.HomeModel = function(_config) {
    var self = this;

    var defaultConfig = {
        projectUrl: '',
        epicsUrl: ''
    };

    var config = $.extend({}, defaultConfig, _config);

    var colorMapping = {
      // unstarted: 'yellowgreen',
      // rejected: '#FA2E48',
      // started: '#66f',
      // finished: '#6917ED',
      // accepted: 'grey',
      delivered: 'grey',
    }

    function getData(url, success, done, $container) {
        $.ajax({
            url: url,
            type: 'GET',
            success: function(response) {
                if (response) {
                    if (!response.success || !response.data) {
                        if (response.message) {
                            $container.html(Pivotal.Templates.renderTemplate('error', response.message));
                        } else {
                            $container.html(Pivotal.Templates.renderTemplate('error', 'Unable to fetch data'));
                        }

                        return
                    }

                    success(response);
                } else {
                    $container.html(Pivotal.Templates.renderTemplate('error', 'Unable to fetch data'));
                }
            },
            error: function(err) {
                $container.html(Pivotal.Templates.renderTemplate('error', 'Unable to fetch data'));
            },
            complete: function () { done() }
        });
    }

    self.refreshEpics = function(project_id, showFinished) {
        var $projectControl = $('[data-project-id="' + project_id + '"]');

        var url = config.epicsUrl.replace('PROJECT_ID', project_id);
        if (showFinished) {
            url += '?show_finished';
        }
        getData(url, function(response) {
            $('.project-epics', $projectControl).html('');

            // TODO: Mangle epics data for dougnut

            response.data.forEach(function(epic) {
                var $node = $(Pivotal.Templates.renderTemplate('epic-info', epic))
                  .appendTo($('.project-epics', $projectControl));

                $node = $node.find('canvas');

                var deliveredValue = 0, otherValue = 0;

                for(var i = 0, p; p = epic.progress_by_states[i]; i++) {
                  if (p.name === 'delivered') {
                    deliveredValue = p.value;
                  } else {
                    otherValue += p.value;
                  }
                }

                var labels = ['delivered', 'other'],
                  data = [deliveredValue, otherValue],
                  backgroundColors = ['grey', 'white'];

                var data = {
                  // labels: epic.progress_by_states.map(function(item) { return item.name }),
                  labels: labels,
                  datasets: [{
                      // data: epic.progress_by_states.map(function(item) { return item.value }),
                      // backgroundColor: epic.progress_by_states.map(function(item) { return colorMapping[item.name] || 'white' }),
                      data: data,
                      backgroundColor: backgroundColors,
                      borderColor: 'grey',
                      borderWidth: 1
                  }]
                };

                var options = {
                  animation: { animateRotate: true },
                  cutoutPercentage: 60,
                  legend: { display: false },
                  tooltips: { enabled: true },
                  hover: {mode: null}
                };

              var ctx = $node[0];
              var chart = new Chart(ctx, {
                  type: 'doughnut',
                  data: data,
                  fillOpacity: .5,
                  options: options
              });
            });
        }, function() {
        }, $projectControl)
    };

    self.refreshProjects = function() {
        $('.projects-container').html(Pivotal.Templates.renderTemplate('loader', {text: 'Loading projects...'}));

        getData(config.projectsUrl, function(response) {
            var projects = response.data;

            if (projects) {
                $('.projects-container').html('');
                if (projects && projects.length) {
                    projects.forEach(function(project) {
                        $('.projects-container').append(Pivotal.Templates.renderTemplate('project-container', project));
                        self.refreshEpics(project.project_id);
                    });
                } else {
                    $('.projects-container').html(Pivotal.Templates.renderTemplate('error', 'No projects found.'))
                }
            }
        }, function() {
            //TODO: Render "refresh projects" control
        }, $('.projects-container'));
    };

    self.refreshProject = function(e) {
        var $projectControl = $(e.currentTarget).parents('[data-project-id]'),
            projectId = $projectControl.attr('data-project-id');

        if (projectId) {
            $projectControl.find('.project-epics').html(
                Pivotal.Templates.renderTemplate('loader', {"text": "Loading epics information..", "cls": "spinner-sm"})
            );

            self.refreshEpics(projectId, $(e.currentTarget).is(':checked'));
        }
    }

    self.init = function() {
        $('body').on('click', '[name="show_finished"]', self.refreshProject);

        self.refreshProjects();
    };

    self.init();
};
