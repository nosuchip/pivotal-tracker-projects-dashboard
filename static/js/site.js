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
        transactionsUrl: '',
        chartConfig: {
            type: 'horizontalBar',
            data: {
                labels: ["", ""],
                datasets: [{
                    label: "",
                    data: [100, 75],        //config.chartConfig.data.datasets[0].data
                    backgroundColor: ["#669911", "#119966"],
                }]
            },
            options: {
                legend: {display: false},
                tooltips: {mode: false},
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        position: "top",
                        ticks: {
                            min: 0,         //config.chartConfig.options.scales.xAxes[0].ticks.min
                            max: 100,       ////config.chartConfig.options.scales.xAxes[0].ticks.max
                            stepSize: 25    //config.chartConfig.options.scales.xAxes[0].ticks.stepSize
                        },
                        barThickness: 4,
                        gridLines: {
                            display: false,
                            color: "rgb(255, 255, 255)",
                        }
                    }],
                    yAxes: [{
                        barThickness: 4,
                        gridLines: {
                            display: false,
                            color: "rgb(255, 255, 255)",
                        }
                    }]
                }

            }
        }
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

    self.refreshEpic = function(epic) {
        var $epicControl = $('[data-epic-id="' + epic.epic_id + '"]');

    getData(epic.url, function(response) {
            console.log('Loading epic ' + epic.epic_id);
            $epicControl.html(Pivotal.Templates.renderTemplate('epic-info', response.data));

            var chartCanvas = $epicControl.find('canvas')[0];
            var chartContext = $epicControl.find('canvas')[0].getContext("2d");

            config.chartConfig.data.datasets[0].data = [response.data.story_points, response.data.progress];
            var chart = new Chart(chartContext, config.chartConfig);
            $epicControl.data('chart', chart);

        }, function() {
            //TODO: Render "refresh epic" control
            console.log('Epic ' + epic.epic_id + ' loaded!');
        }, $epicControl)
    };

    self.refreshProjects = function() {
        $('.page-container').html(Pivotal.Templates.renderTemplate('loader', {text: 'Loading projects...'}));

        getData(config.projectsUrl, function(response) {
            var projects = response.data.projects;

            if (projects) {
                $('.page-container').html('');
                projects.forEach(function(project) {
                    $('.page-container').append(Pivotal.Templates.renderTemplate('project-container', project));
                    project.epics.forEach(self.refreshEpic);
                });
            }
        }, function() {
            //TODO: Render "refresh projects" control
        }, $('.page-container'));
    };

    self.init = function() {
        self.refreshProjects();
    };

    self.init();
};
