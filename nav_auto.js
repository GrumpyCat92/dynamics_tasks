var Navicon = Navicon || {};

Navicon.nav_auto = (function () {

    var setUsedFields = function (formContext, isUsedAtt) {
        const ownerCountField = formContext.getControl("nav_ownerscount");
        const kmField = formContext.getControl("nav_km");
        const isDamagedField = formContext.getControl("nav_isdamaged");
        const showFields = isUsedAtt && isUsedAtt.getValue();

        ownerCountField.setVisible(showFields);
        kmField.setVisible(showFields);
        isDamagedField.setVisible(showFields);
    }

    return {
        onLoad: function (executionContext) {
            const formContext = executionContext.getFormContext();
            //attributes
            const isUsedAtt = formContext.getAttribute("nav_used");

            setUsedFields(executionContext.getFormContext(), isUsedAtt);

            isUsedAtt && isUsedAtt.addOnChange(function (executionContext) {
                setUsedFields(executionContext.getFormContext(), isUsedAtt)
            });
        }
    };
})();