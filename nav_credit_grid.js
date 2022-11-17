document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        getModels();
    }
}

function getModels() {
    let id = Xrm.Page.data.entity.getId();
    id = id.substring(1, id.length - 1);
    const table = document.getElementById("model_grid")
        .getElementsByTagName("tbody")[0];


    const fetchXML = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="true">
    <entity name="nav_nav_credit_nav_auto">
    <attribute name="nav_creditid" />
    <link-entity name="nav_credit" from="nav_creditid" to="nav_creditid" intersect="true"  alias="credit">
    <attribute name="nav_name" />
    <attribute name="nav_creditid" />
    <attribute name="nav_creditperiod" />
    </link-entity>
    <link-entity name="nav_auto" from="nav_autoid" to="nav_autoid" intersect="true" alias="auto">
    <attribute name="nav_name" />
    <link-entity name="nav_model" from="nav_modelid" to="nav_modelid" intersect="true" alias="model">
    <attribute name="nav_modelid" />
    <attribute name="nav_name" />
    <link-entity name="nav_brand" from="nav_brandid" to="nav_brandid" intersect="true" alias="brand">
    <attribute name="nav_name" />
    <filter type="and">
    <condition attribute="nav_brandid" operator="eq" value="${id}" />
    </filter>
    </link-entity>
    </link-entity>
    </link-entity>
    </entity>
    </fetch>`;


    Xrm.WebApi.retrieveMultipleRecords('nav_nav_credit_nav_auto', `?fetchXml=${fetchXML}`)
        .then(
            function success(result) {
                result.entities.forEach(function (val) {
                    const row = table.insertRow(table.rows.length);
                    row.innerHTML = `<td><span onclick='handleModelClick("${val["model.nav_modelid"]}")'>${val["model.nav_name"] ?? ""}</span></td>
                    <td><span onclick='handleCreditClick("${val["credit.nav_creditid"]}")'>${val["credit.nav_name"] ?? ""}</span></td>
                    <td>${val["credit.nav_creditperiod"] ?? ""} </td>`;
                });
            },
            function (error) {
                console.log(error.message);
            }
        );

}

function handleModelClick(id) {
    var windowOptions = {
        openInNewWindow: true
    };
    Xrm.Utility.openEntityForm("nav_model", id, null, windowOptions)
}

function handleCreditClick(id) {
    var windowOptions = {
        openInNewWindow: true
    };
    Xrm.Utility.openEntityForm("nav_credit", id, null, windowOptions)
}