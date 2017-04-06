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
            response.data.forEach(function(epic) {
                $('.project-epics', $projectControl).append(Pivotal.Templates.renderTemplate('epic-info', epic));
            })
        }, function() {
        }, $projectControl)
    };

    self.refreshProjects = function() {
        $('.page-container').html(Pivotal.Templates.renderTemplate('loader', {text: 'Loading projects...'}));

        getData(config.projectsUrl, function(response) {
            var projects = response.data;

            if (projects) {
                $('.page-container').html('');
                projects.forEach(function(project) {
                    $('.page-container').append(Pivotal.Templates.renderTemplate('project-container', project));
                    self.refreshEpics(project.project_id);
                });
            }
        }, function() {
            //TODO: Render "refresh projects" control
        }, $('.page-container'));
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
