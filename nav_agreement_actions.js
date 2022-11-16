var Navicon = Navicon || {};

Navicon.nav_agreement_actions = (function () {

    var calculateFullSum = function (creditSum, periodValue) {
        const creditId = Xrm.Page.getAttribute("nav_creditid");
        const creditFullSum = Xrm.Page.getAttribute("nav_fullcreditamount");
        if (!creditId || creditId.getValue() == null) return 0;
        const id = (creditId.getValue())[0].id
        Xrm.WebApi.retrieveRecord('nav_credit', id, '?$select=nav_percent')
            .then(
                function success(result) {
                    percent = result.nav_percent;
                    const fullSum = (percent / 100 * periodValue * creditSum) + creditSum;

                    //set Полная стоимость кредита
                    creditFullSum.setValue(fullSum);
                },
                function (error) {
                    alert(`Error with getting credit info: ${error.message}`);
                    return 0;
                }
            );
    }

    var calculateSum = function (sumValue, initialVal, creditSum) {
        const creditValue = sumValue - initialVal;

        if (creditValue <= 0) {
            Xrm.Navigation.openAlertDialog({ text: "Сумма кредита не может быть отрицательной" });
            return;
        }
        //set Сумма кредита
        creditSum.setValue(creditValue);

        return creditValue;
    }

    return {
        creditButton: function () {
            const sum = Xrm.Page.getAttribute("nav_summa");
            const creditSum = Xrm.Page.getAttribute("nav_creditamount");
            const initialFee = Xrm.Page.getAttribute("nav_initialfee");
            const period = Xrm.Page.getAttribute("nav_creditperiod");

            if (!sum || !creditSum || !initialFee || !period) return;

            const initialVal = initialFee.getValue();
            const sumValue = sum.getValue();
            const periodValue = period.getValue();

            if (!initialVal || !sumValue || !periodValue) {
                Xrm.Navigation.openAlertDialog({ text: "Поля Сумма, Первоначальный взнос и Срок кредита должны быть заполнены" });
                return;
            }

            const credit = calculateSum(sumValue, initialVal, creditSum);

            calculateFullSum(credit, periodValue);

        }
    }
})();