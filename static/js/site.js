Handlebars.registerHelper('renderTemplate', function (templateId, context, options) {
  try {
    context = JSON.parse(context);
  } catch (e) { }

  return new Handlebars.SafeString(Pivotal.Templates.renderTemplate(templateId, context));
});

Handlebars.registerHelper('urlencode', encodeURIComponent);

function loading(on, message) {
  if (on) {
    $('.loader .message').append('<div class="submessage" data-message="' +
      encodeURIComponent(message) + '">' +
      message + '</div>');

    $('.loader').show();
  } else {
    var element = $('.loader .message').find('[data-message="' + encodeURIComponent(message) + '"]');
    element.remove();
  }

  if (!$('.loader .message .submessage').length) {
    $('.loader').hide();
  }
}

this.Pivotal = this.Pivotal || {};

Pivotal.HomeModel = function (_config) {
  var self = this;

  var defaultConfig = {
    projectUrl: '',
    epicsUrl: ''
  };

  var config = $.extend({}, defaultConfig, _config);

  var backgroundColors = [
    // accepted
    'rgba(124, 164, 58, 1)',

    // unscheduled
    'rgba(144, 174, 203, 1)',

    // ready (delivered, finished, started, rejected)
    'rgba(248, 245, 163, 1)',

    // other
    'rgba(153, 153, 153, 1)'
];

  var existingEpics = [];

  function getData(url, success, done, $container) {
    $.ajax({
      url: url,
      type: 'GET',
      success: function (response) {
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
      error: function (err) {
        $container.html(Pivotal.Templates.renderTemplate('error', 'Unable to fetch data'));
      },
      complete: function () { done() }
    });
  }

  self.loadEpics = function (project) {
    var message = 'Loading epics for project "' + project.name + '"...';
    loading(1, message);

    var url = config.epicsUrl.replace('PROJECT_ID', project.project_id);
    getData(url, function (response) {
      response.data.forEach(function (epic) {
        if (existingEpics.indexOf(epic.name) !== -1) {
          return;
        }

        existingEpics.push(epic.name);

        var $node = $(Pivotal.Templates.renderTemplate('epic-info', epic)).appendTo($('.epics-container'));

        $node = $node.find('canvas');

        var deliveredValue = 0, otherValue = 0;

        var accepted=0, unscheduled=0, deliveredAndCo=0, other=0;

        for (var i = 0, p; p = epic.progress_by_states[i]; i++) {
          switch(p.name) {
            case 'accepted':
              accepted = p.value;
              break;
            case 'unscheduled':
              unscheduled = p.value;
              break;
            case 'delivered':
            case 'finished':
            case 'started':
            case 'rejected':
              deliveredAndCo += p.value;
              break;
            default:
              other += p.value;
          }
        }

        var chartData = {
          labels: ['accepted', 'unscheduled', 'ready', 'other'],
          datasets: [{
            data: [accepted, unscheduled, deliveredAndCo, other],
            backgroundColor: backgroundColors,
            borderColor: 'grey',
            borderWidth: 1
          }]
        };

        var options = {
          animation: { animateRotate: true },
          cutoutPercentage: 60,
          legend: { display: false },
          tooltips: {
            enabled: true,
          },
          hover: { mode: null }
        };

        var ctx = $node[0];
        var chart = new Chart(ctx, {
          type: 'doughnut',
          data: chartData,
          fillOpacity: 0.5,
          options: options
        });
      });
      loading(0, message);
    }, function () {
    }, $('.epics-container'));
  };

  self.refresh = function () {
    loading(false);
    loading(true, 'Loading projects...');
    $('.projects-container').html('');

    getData(config.projectsUrl, function (response) {
      var projects = response.data;

      if (projects && projects.length) {
        projects.forEach(function (project) {
          self.loadEpics(project);
        });
      } else {
        $('.projects-container').html(Pivotal.Templates.renderTemplate('error', 'No projects found.'))
      }
    }, function () {
      loading(false, 'Loading projects...');
    }, $('.projects-container'));
  };

  self.refreshProject = function (e) {
    var $projectControl = $(e.currentTarget).parents('[data-project-id]'),
      projectId = $projectControl.attr('data-project-id');

    if (projectId) {
      $projectControl.find('.project-epics').html(
        Pivotal.Templates.renderTemplate('loader', { "text": "Loading epics information..", "cls": "spinner-sm" })
      );

      self.refreshEpics(projectId, $(e.currentTarget).is(':checked'));
    }
  };

  self.init = function () {
    self.refresh();
  };

  self.init();
};
