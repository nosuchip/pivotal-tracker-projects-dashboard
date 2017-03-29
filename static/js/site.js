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
        apiKey: '',
        transactionsUrl: ''
    };
    var config = $.extend({}, defaultConfig, _config);

    // self.loading = function(state, parent) {
    //     parent = parent || body;

    //     $loader = $('.loader', parent);

    //     if (!$loader.length) {
    //         $(parent).append(Pivotal.Templates.renderTemplate('loader', {text: 'Loading...'}));
    //     }

    //     if (state) {
    //         $('.loader', parent).show();
    //     } else {
    //         $('.loader', parent).hide();
    //     }
    // }

    function getData(url, success, done, $container) {
        $.ajax({
            url: url,
            type: 'GET',
            success: function(response) {
                if (response) {
                    if (!response.success || !response.data) {
                        if (response.message) {
                            $container.html(Pivotal.Templates.renderTemplate('error', message));
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

    self.refreshProjects = function() {
        $('.page-container').html(Pivotal.Templates.renderTemplate('loader', {text: 'Loading projects...'}));

        getData(config.projectsUrl, function(response) {
            var projects = response.data.projects;

            if (projects) {
                $('.page-container').html('');

                projects.forEach(function(project) {
                    $('.page-container').append(Pivotal.Templates.renderTemplate('project-container', project));

                    var epics = project.epics;
                    epics.forEach(function(epic) {
                        var $epicControl = $('[data-epic-id="' + epic.epic_id + '"]');
                        getData(epic.url, function(response) {
                            console.log('Loading epic ' + epic.epic_id);
                            $epicControl.html(Pivotal.Templates.renderTemplate('epic-info', response.data))
                        }, function() {
                            //TODO: Render "refresh epic" control
                            console.log('Epic ' + epic.epic_id + ' loaded!');
                        }, $epicControl)
                    });
                });
            }
        }, function() {
            //TODO: Render "refresh page" control
        }, $('.page-container'));
    };

    self.init = function() {
        self.refreshProjects();
    };

    self.init();
};
