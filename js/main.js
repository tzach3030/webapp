function PageLoad() {
    var currentHash = localStorage.getItem("currentHash");
    if(currentHash !== null){ // load the tab from the last time
        document.location.hash = currentHash;
    }
    else { // Default tab - quick-reports
        document.location.hash = "#!quick-reports";
    }

    loadTabs();
    loadToolBar('quick-reports');
    loadToolBar('my-team-folders');
    loadFormContent('quick-reports');
    loadFormContent('my-team-folders');

    UTILS.ajax('./data/config.json',{
        done: function (data) {
            var notifications = document.getElementsByClassName("notifications")[0]; // get the notif area
            if(data.notification){
                notifications.innerHTML = data.notification; // show notification content if exsit
            }
            else{
                notifications.style.display = "none"; // hide notification area
            }
        }
    });
}

function SelectTab(e) {
    var currentHash = localStorage.getItem("currentHash");
    if(currentHash !== null){
        localStorage.removeItem("currentHash"); // remove the current hash for save a new one
    }
	e.preventDefault(); // Prevent jump
	var select = e.currentTarget; // the whole url
    var newHash = select.hash.substring(1,select.hash.length); // without the #
    localStorage.setItem("currentHash","!" + newHash); // save the latest tab
	document.location.hash = "!" + newHash; // change the current hash, there is a ! that prevent the jump

	loadTabs();
}

function loadTabs() {
	var tempHash = document.location.hash;
    var currentHash = "#" + tempHash.substring(2,tempHash.length);
	var tabs = document.getElementsByClassName("tabs")[0];
    var tabList = tabs.getElementsByTagName("ul")[0];
    var TabsContent = tabList.getElementsByTagName("a"); // get the tab list

    for (var i = 0; i < TabsContent.length; i++) {
    	var currentTab = TabsContent[i];
        var index = "tab" + (i + 1);
        var tab = tabs.getElementsByClassName(index)[0]; // get another tab every time
    	if (currentTab.hash === currentHash) {
    		currentTab.style.backgroundColor = "rgb(211,211,211)"; // the current tab style
    		currentTab.style.color = "black";
            tab.style.display = "block"; // show the relevant tab
    	} else {
    		currentTab.style.backgroundColor = "rgb(51,51,51)"; // not the current tab style
    		currentTab.style.color = "white";
            tab.style.display = "none"; // hide the relevant tabs
    	}
    }
}

function OpenSetting(TabName,id) {
    var field = document.getElementById(id); // get the first field in the form
    var tab = document.getElementById(TabName);
    var form = tab.getElementsByClassName("form-area")[0]; // get the form
    setTimeout(function() { field.focus() }, 20); // focus the the first input 
    if(form.style.display === "none") // toggle the form
        form.style.display = "block";
    else
        form.style.display = "none";
}

function OpenNewTab(TabName) { // open the iframe in a new tab 
    var tab = document.getElementById(TabName);
    var url = tab.getElementsByTagName("iframe")[0].getAttribute("src"); // the iframe url
    window.open(url);
}

function SubmitForm(TabName,form) {
    var newSites = [];
    var valid1 = true;
    var valid2 = true;
    var myForm = form.getElementsByClassName("form-content"); // get the form
    for (var i = 0; i < myForm.length; i++) {
        var current = myForm[i];
        var SiteName = current.getElementsByClassName("name")[0].value; // get site name from the form
        var SiteUrl = current.getElementsByClassName("url")[0].value; // get site url from the form

        ResetBorder(current.getElementsByClassName("name")[0]); //reset the red border
        ResetBorder(current.getElementsByClassName("url")[0]);

        if (SiteName === "" && SiteUrl === "") { // strat new iterate if both empty
            continue;
        }

        valid1 = ValidInput(current.getElementsByClassName("name")[0]);
        valid2 = ValidInput(current.getElementsByClassName("url")[0]) &&
        ValidURL(current.getElementsByClassName("url")[0]);

        var SiteUrl = current.getElementsByClassName("url")[0].value;

        var newSite = {};
        newSite.Name = SiteName;
        newSite.Url = SiteUrl;
        newSites.push(newSite); // push the new obj to the array
    }

    if(valid1 && valid2) // if all form valid
    {
        localStorage.removeItem(TabName + "SitesArr"); // remove the latest array to save a new one
        localStorage.setItem(TabName + "SitesArr",JSON.stringify(newSites)); // save the current array
        loadToolBar(TabName);
        form.style.display = "none"; // hide the form
    }
    else{
        return false;
    }
}

function ValidInput(input) {
    if( input.value === "") { // check if the filed is not empty
        input.style.border = "2px solid red";
        input.focus();
        return false;
    }
    return true;
}

function ValidURL(input) {
    var regex = /[w]{3,}\.[A-Za-z0-9]/;
    if(!regex.test(input.value)) { // check if url valid
        input.style.border = "2px solid red";
        return false;
        input.focus();
    }
    else {
        var st = input.value.substring(0,7);
        if(st.indexOf("http://") === -1)
            input.value = "http://" + input.value; // add http:// if needed
        return true;
    }
}

function ResetBorder(input) {
    input.style.border = "initial";
}

function loadToolBar(TabName) {
    var tab = document.getElementById(TabName);
    var GoTo = tab.getElementsByClassName("goToLink")[0]; // get the open new tab element
    var Sites = tab.getElementsByTagName("select")[0]; // get the combobox
    var iframe = tab.getElementsByTagName("iframe")[0]; // get the iframe
    var SitesArr = JSON.parse(localStorage.getItem(TabName + "SitesArr")); // get the latest site array
    if(SitesArr !== null) {
        Siteslength = SitesArr.length;
    }
    if(SitesArr === null || Siteslength == 0) { // hide tool bar if there are no sites
        GoTo.style.visibility = "hidden";
        Sites.style.visibility = "hidden";
        iframe.style.display = "none";
    }
    else { // show tool bar
        loadSites(TabName);
        GoTo.style.visibility = "visible";
        Sites.style.visibility = "visible";
        iframe.style.display = "block";
    }
}

function esc(e,TabName) { // hide form if esc was pressed
    var e = window.event || e; 
    if(e.keyCode === 27)
    {
        var tab = document.getElementById(TabName);
        var form = tab.getElementsByClassName("form-area")[0];
        form.style.display = "none"; // hide form
    }    
}

function loadSites(TabName) {
    var tab = document.getElementById(TabName);
    var SelectSites = tab.getElementsByTagName("select")[0]; // get the combobox
    var iframe = tab.getElementsByTagName("iframe")[0]; // get the iframe
    var SitesOptions = JSON.parse(localStorage.getItem(TabName + "SitesArr")); // get the latest array

    while(SelectSites.options.length > 0){ // clear the site combobox                
        SelectSites.remove(0);
    }

    for (var i = 0; i < SitesOptions.length; i++) { // update the combobox with the current sites
        var newOption = document.createElement("option");
        newOption.text = SitesOptions[i].Name;
        newOption.value = SitesOptions[i].Url;
        SelectSites.add(newOption);    
    }
    iframe.setAttribute("src",SitesOptions[0].Url); // set the iframe url to the first site in the combobox
}

function SiteSelect(TabName) {
    var tab = document.getElementById(TabName);
    var Sites = tab.getElementsByTagName("select")[0]; // get the combobox
    var iframe = tab.getElementsByTagName("Iframe")[0]; // get the iframe

    var NewUrl = Sites.options[Sites.selectedIndex].value; // get the selected url
    iframe.setAttribute("src", NewUrl); // change the iframe url when the user pick another site
}

function loadFormContent(TabName) {
    var tab = document.getElementById(TabName);
    var myForm = tab.getElementsByClassName("form-content"); // get the form
    var SitesArr = JSON.parse(localStorage.getItem(TabName + "SitesArr")); // get the latest site araay
    if(SitesArr === null)
        return;
    for (var i = 0; i < SitesArr.length; i++) { // restore the form content
        var current = myForm[i];
        current.getElementsByClassName("name")[0].value = SitesArr[i].Name;
        current.getElementsByClassName("url")[0].value = SitesArr[i].Url;
    }
}

function SearchReport(e) {
    e.preventDefault(); // prevent the submit
    var currentHash = document.location.hash;
    var TabName = currentHash.substring(2,currentHash.length); // extract the tab name from the hash
    var tab = document.getElementById(TabName);
    var Sites = tab.getElementsByTagName("select")[0]; // get the combobox
    var SitesArr = JSON.parse(localStorage.getItem(TabName + "SitesArr")); // get the latest site araay
    var forSearch = document.getElementById("search").value; // what the user search
    var notifications = document.getElementsByClassName("notifications")[0]; // get the notif area

    for (var i = 0; i < SitesArr.length; i++) { // check if content that the user searched is exsit
        var name = SitesArr[i].Name;
        var check = name.indexOf(forSearch); // check if name is part of a site name
        if(check !== -1){
            Sites.selectedIndex = i;
            SiteSelect(TabName);
            return;
        }
    }
    var message = "\"The searched report " + forSearch + " was not found.\"";
    notifications.innerHTML = message; // post a message if the content does not exsit
    notifications.style.display = "block"; // show notification area if it is hide
}

