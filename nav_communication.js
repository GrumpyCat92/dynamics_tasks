var Navicon = Navicon || {};

Navicon.nav_communication = (function () {

    var showPhoneOrEmailFields = function (formContext, typeAtt) {
        const typeValue = typeAtt.getValue();
        const emailField = formContext.getControl("nav_email");
        const phoneField = formContext.getControl("nav_phone");
        if (!typeValue) {
            emailField.setVisible(false);
            phoneField.setVisible(false);
        } else if (typeValue == 1) {
            emailField.setVisible(false);
            phoneField.setVisible(true);
        } else if (typeValue == 2) {
            emailField.setVisible(true);
            phoneField.setVisible(false);
        }
    }

    return {
        onLoad: function (executionContext) {
            const formContext = executionContext.getFormContext();
            //attributes
            const typeAtt = formContext.getAttribute("nav_type");

            showPhoneOrEmailFields(executionContext.getFormContext(), typeAtt);

            typeAtt && typeAtt.addOnChange(function (executionContext) {
                showPhoneOrEmailFields(executionContext.getFormContext(), typeAtt)
            });
        }
    };
})();