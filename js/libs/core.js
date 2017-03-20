Fliplet.FormBuilder = (function () {
  var fields = [];
  var components = {};
  var eventHub = new Vue();

  var templates = Fliplet.Widget.Templates;

  function name(component) {
    return 'fl' + component.charAt(0).toUpperCase() + component.slice(1);
  }

  return {
    on: function (eventName, fn) {
      eventHub.$on(eventName, fn);
    },
    off: function (eventName, fn) {
      eventHub.$off(eventName, fn);
    },
    field: function (componentName, component) {
      if (!component.name) {
        throw new Error('The component name is required');
      }

      var template = templates['templates.components.' + componentName];

      if (!template) {
        throw new Error('A template for the ' + componentName + ' component has not been found');
      }

      component.template = templates['templates.components.field']({
        template: template()
      });

      componentName = name(componentName);
      components[componentName] = component;

      _.extend(component.props, {
        name: {
          type: String,
          required: true
        },
        label: {
          type: String,
          default: component.name || 'Label text'
        },
        value: {
          type: String
        }
      });

      Vue.component(componentName, component);
    },
    fields: function () {
      return Object.keys(components);
    },
    configuration: function (componentName, component) {
      if (!component) {
        component = {};
      }

      var template = templates['templates.configurations.' + componentName];

      component.template = templates['templates.configurations.form']({
        template: template && template() || ''
      });

      componentName = name(componentName);

      // Extend from base component
      component = _.assign({
        methods: {}
      }, _.pick(components[componentName], [
        'props'
      ]), component);

      component.methods._onSubmit = function () {
        var $vm = this;
        var data = {};

        Object.keys($vm.$props).forEach(function (prop) {
          data[prop] = $vm[prop];
        });

        eventHub.$emit('field-settings-changed', data);
      }

      if (!component.methods.onSubmit) {
        component.methods.onSubmit = component.methods._onSubmit;
      }

      Vue.component(componentName + 'Config', component);
    }
  };
})();