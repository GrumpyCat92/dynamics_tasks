var Navicon = Navicon || {};

Navicon.nav_credit = (function () {

    return {
        onSave: function (executionContext) {
            const formContext = executionContext.getFormContext();
            //attributes
            const startDateAtt = formContext.getAttribute("nav_datestart");
            const endDateAtt = formContext.getAttribute("nav_dateend");

            if (startDateAtt && endDateAtt) {
                const startValue = startDateAtt.getValue();
                const endValue = endDateAtt.getValue();

                var year = startValue.getFullYear();
                var month = startValue.getMonth();
                var day = startValue.getDate();
                var startDatePlusOneYear = new Date(year + 1, month, day);

                if (startDatePlusOneYear > endValue) {
                    Xrm.Navigation.openAlertDialog({ text: "Дата окончания должна быть больше даты начала не менее, чем на год" });
                    executionContext.getEventArgs().preventDefault();
                }
            }
        }
    };
})();