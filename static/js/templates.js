// Roburst Handlebars caching (compiled templates and rendered content)

this.Pivotal = this.Pivotal || {};
this.Pivotal.Templates = this.Pivotal.Templates || {};

Pivotal.Templates.cache = {};

Pivotal.Templates.getTemplate = function(templateId) {
    if (!Pivotal.Templates.cache[templateId]) {
        var templateElement = document.getElementById(templateId);

        if (templateElement) {
            Pivotal.Templates.cache[templateId] = Handlebars.compile(templateElement.innerHTML);
        }
    }

    return Pivotal.Templates.cache[templateId];
};

Pivotal.Templates.renderTemplate = function(templateId, context) {
    var renderedKey = templateId + JSON.stringify(context);

    if (!Pivotal.Templates.cache[renderedKey]) {
        var template = Pivotal.Templates.getTemplate(templateId);

        if (template) {
            Pivotal.Templates.cache[renderedKey] = template(context).trim();
        } else {
            return '';
        }
    }

    return Pivotal.Templates.cache[renderedKey];
};
