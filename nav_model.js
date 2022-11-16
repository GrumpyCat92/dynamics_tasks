var Navicon = Navicon || {};

Navicon.nav_model = (function () {

    var hasCurrentUserRole = function (roleName) {
        let hasRole = false;
        let roles = Xrm.Utility.getGlobalContext().userSettings.roles;
        roles.forEach(x => {
            if (x.name === roleName) {
                hasRole = true;
                return;
            }
        });
        return hasRole;
    }

    var formInCreateMode = function () {
        var formType = Xrm.Page.ui.getFormType();
        if (formType == 1) {
            return true;
        }
        return false;
    }

    return {
        onLoad: function (executionContext) {
            if (formInCreateMode()) return;
            if (hasCurrentUserRole("Системный администратор")) return;

            const formContext = executionContext.getFormContext();

            formContext.ui.controls.forEach(function (control, i) {
                if (control && control.getDisabled && !control.getDisabled()) {
                    control.setDisabled(true);
                }
            });
        }
    };
})();