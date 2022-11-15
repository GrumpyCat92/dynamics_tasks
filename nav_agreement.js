var Navicon = Navicon || {};

Navicon.nav_agreement = (function () {
    //show Credit tab
    var showCreditTab = function (formContext, autoAttr, contactAttr, creditTab) {
        //controls
        const creditField = formContext.getControl("nav_creditid");

        if (autoAttr && contactAttr && autoAttr.getValue() && contactAttr.getValue()) {
            creditTab.setVisible(true);
            creditField && creditField.setVisible(true);
        } else {
            creditTab.setVisible(false);
            creditField && creditField.setVisible(false);
        }
    }

    //show credit tab's field
    var showCreditTabFields = function (formContext, creditProgram) {
        if (!creditProgram) return;
        const isShow = creditProgram.getValue() != null;
        const creditPeriodField = formContext.getControl("nav_creditperiod");
        const creditAmountField = formContext.getControl("nav_creditamount");
        const fullAmountField = formContext.getControl("nav_fullcreditamount");
        const feeField = formContext.getControl("nav_initialfee");
        const factSummaField = formContext.getControl("nav_factsumma");
        const datePaymentField = formContext.getControl("nav_paymantplandate");

        creditPeriodField && creditPeriodField.setVisible(isShow);
        creditAmountField && creditAmountField.setVisible(isShow);
        fullAmountField && fullAmountField.setVisible(isShow);
        feeField && feeField.setVisible(isShow);
        factSummaField && factSummaField.setVisible(isShow);
        datePaymentField && datePaymentField.setVisible(isShow);
    }

    //remove extra characters in agreement's number
    var agreementValueValidation = function (formContext) {
        const numberField = formContext.getAttribute("nav_name");
        if (!numberField) return;
        const numberValue = numberField.getValue();
        if (numberValue) {
            const newNumber = numberValue.replace(/[^\d-]/g, '');
            numberField.setValue(newNumber);
        }
    }

    //form request and assign filter to credit field
    var filterCredit = function (auto, creditField) {
        if (!creditField) return;
        if (!auto || auto.length == 0) return;
        const autoId = auto[0].id;
        const fetchXML = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="true">
                <entity name="nav_credit">
                <attribute name="nav_creditid" />
                <link-entity name="nav_nav_credit_nav_auto" from="nav_creditid" to="nav_creditid" intersect="true">
                <attribute name="nav_creditid" />
                <filter type="and">
                <condition attribute="nav_autoid" operator="eq" value="${autoId}" />
                </filter>
                </link-entity>
                </entity>
                </fetch>`;
        Xrm.WebApi.retrieveMultipleRecords('nav_credit', `?fetchXml=${fetchXML}`)
            .then(
                function success(result) {
                    var filter = `<filter type='and'><condition attribute='nav_creditid' operator = 'in'>`;
                    result.entities.forEach(function (val) {
                        filter += "<value>{" + val.nav_creditid + "}</value>"
                    });
                    filter += "</condition></filter>";
                    return filter;
                },
                function (error) {
                    console.log(error.message);
                }
            )
            .then(
                function success(filter) {
                    creditField.addPreSearch(function () {
                        addFilterToCredit(filter, creditField)
                    })
                }
            );
    }

    // add filter to credit field
    var addFilterToCredit = function (filter, creditField) {
        creditField.addCustomFilter(filter, "nav_credit")
    }

    return {
        onLoad: function (executionContext) {
            const formContext = executionContext.getFormContext();
            //controls 
            const creditTab = Xrm.Page.ui.tabs.get("tab_credit");
            const creditField = formContext.getControl("nav_creditid");
            //attributes
            const autoAttr = formContext.getAttribute("nav_autoid");
            const contactAttr = formContext.getAttribute("nav_contactid");
            const creditAtt = formContext.getAttribute("nav_creditid");
            const numberAtt = formContext.getAttribute("nav_name");

            showCreditTab(executionContext.getFormContext(), autoAttr, contactAttr, creditTab);
            showCreditTabFields(executionContext.getFormContext(), creditAtt)

            //events
            autoAttr && autoAttr.addOnChange(function (executionContext) {
                showCreditTab(executionContext.getFormContext(), autoAttr, contactAttr, creditTab);
                filterCredit(autoAttr.getValue(), creditField);
            });
            contactAttr && contactAttr.addOnChange(function (executionContext) {
                showCreditTab(executionContext.getFormContext(), autoAttr, contactAttr, creditTab)
            });
            creditAtt && creditAtt.addOnChange(function (executionContext) {
                showCreditTabFields(executionContext.getFormContext(), creditAtt);
            });
            numberAtt && numberAtt.addOnChange(function (executionContext) {
                agreementValueValidation(executionContext.getFormContext());
            })

            //add filters
            autoAttr && filterCredit(autoAttr.getValue(), creditField);
        }
    };
})();