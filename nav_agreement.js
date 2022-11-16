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

    var saveForm = true;

    //check credit
    var checkCreditProgramm = function (creditAtt, dateAtt, creditperiodAtt) {
        const agreementDate = dateAtt.getValue();
        if (agreementDate == null) {
            creditperiodAtt.setValue(null);
            saveForm = true;
        }
        const programm = creditAtt.getValue();
        if (programm == null || programm.length == 0) return;
        const programId = programm[0].id;

        Xrm.WebApi.retrieveRecord('nav_credit', programId, "?$select=nav_dateend").then(
            function success(result) {
                const creditDate = new Date(result.nav_dateend);
                if (agreementDate > creditDate) {
                    Xrm.Navigation.openAlertDialog({ text: "Срок кредитной программы истек" });
                    saveForm = false;
                }
                else {
                    var diffDate = creditDate - Date.now();
                    var ageDate = new Date(diffDate);
                    creditperiodAtt.setValue(Math.abs(ageDate.getUTCFullYear() - 1970));
                    saveForm = true;
                }
            },
            function (error) {
                alert(`Error with getting credit info: ${error.message}`);
            }
        );
    }

    //get auto cost
    var getAutoCost = function (auto, creditAmountAtt) {
        if (!auto || auto.length == 0) {
            creditAmountAtt.setValue(null);
            return;
        }
        const autoId = auto[0].id;

        Xrm.WebApi.retrieveRecord('nav_auto', autoId, '?$select=nav_amount,nav_used&$expand=nav_modelid($select=nav_recommendedamount)').then(
            function success(result) {
                let cost = 0;
                if (result.nav_used === true) {
                    cost = result.nav_amount;
                } else {
                    cost = result.nav_modelid.nav_recommendedamount;
                }
                creditAmountAtt.setValue(cost);
            },
            function (error) {
                alert(`Error with getting auto info: ${error.message}`);
            }
        );
    }

    return {
        onSave: function (executionContext) {
            if (!saveForm) {
                executionContext.getEventArgs().preventDefault();
            }
        },

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
            const dateAtt = formContext.getAttribute("nav_date");
            const creditperiodAtt = formContext.getAttribute("nav_creditperiod");
            const creditAmountAtt = formContext.getAttribute("nav_summa");

            showCreditTab(executionContext.getFormContext(), autoAttr, contactAttr, creditTab);
            showCreditTabFields(executionContext.getFormContext(), creditAtt)

            //events
            autoAttr && autoAttr.addOnChange(function (executionContext) {
                showCreditTab(executionContext.getFormContext(), autoAttr, contactAttr, creditTab);
                filterCredit(autoAttr.getValue(), creditField);
                creditAmountAtt && getAutoCost(autoAttr.getValue(), creditAmountAtt);
            });
            contactAttr && contactAttr.addOnChange(function (executionContext) {
                showCreditTab(executionContext.getFormContext(), autoAttr, contactAttr, creditTab)
            });
            creditAtt && creditAtt.addOnChange(function (executionContext) {
                showCreditTabFields(executionContext.getFormContext(), creditAtt);
                checkCreditProgramm(creditAtt, dateAtt, creditperiodAtt);
            });
            numberAtt && numberAtt.addOnChange(function (executionContext) {
                agreementValueValidation(executionContext.getFormContext());
            })
            dateAtt && dateAtt.addOnChange(function (executionContext) {
                checkCreditProgramm(creditAtt, dateAtt);
            });

            //add filters
            autoAttr && filterCredit(autoAttr.getValue(), creditField);
        }
    };
})();