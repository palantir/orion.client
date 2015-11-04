/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*eslint-env browser, amd*/
define(["require", "orion/xhr", "i18n!orion/shell/nls/messages", "plugins/mesa/resourceFormatter", "plugins/mesa/mesaClient", "orion/bootstrap", "orion/commandRegistry", "orion/fileClient", "orion/git/gitClient", "orion/searchClient",
        "orion/globalCommands", "orion/shell/Shell", "orion/webui/treetable", "shell/shellPageFileService", "shell/paramType-file", "shell/paramType-plugin",
        "shell/paramType-service", "orion/i18nUtil", "orion/extensionCommands", "orion/contentTypes", "orion/PageUtil", "orion/URITemplate", "orion/Deferred",
        "orion/status", "orion/progress", "orion/operationsClient", "shell/resultWriters", "orion/metrics", "orion/URL-shim"],
    function(require, xhr, messages, resourceFormatter, mMesaClient, mBootstrap, mCommandRegistry, mFileClient, mGitClient, mSearchClient, mGlobalCommands, mShell, mTreeTable, mShellPageFileService,
        mFileParamType, mPluginParamType, mServiceParamType, i18nUtil, mExtensionCommands, mContentTypes, PageUtil, URITemplate, Deferred, mStatus, mProgress,
        mOperationsClient, mResultWriters, mMetrics, _) {

    var shellPageFileService, fileClient, gitClient, mesaClient, commandRegistry, output, fileType;
    var hashUpdated = false;
    var serviceRegistry;
    var pluginRegistry, pluginType, preferences, serviceElementCounter = 0;

    var ROOT_ORIONCONTENT = new URL(require.toUrl("file"), window.location.href).pathname; //$NON-NLS-0$
    var PAGE_TEMPLATE = require.toUrl("mesa/mesa-table.html") + "#{,resource}"; //$NON-NLS-0$

	mBootstrap.startup().then(function(core) {
		var serviceRegistry = core.serviceRegistry;
		var pluginRegistry = core.pluginRegistry;
		var preferences = core.preferences;

        commandRegistry = new mCommandRegistry.CommandRegistry({});
        fileClient = new mFileClient.FileClient(serviceRegistry);
        gitClient = new mGitClient.GitService(serviceRegistry);
        mesaClient = new mMesaClient.MesaService(serviceRegistry);
        var searcher = new mSearchClient.Searcher({serviceRegistry: serviceRegistry, commandService: commandRegistry, fileService: fileClient});
        var operationsClient = new mOperationsClient.OperationsClient(serviceRegistry);
        new mStatus.StatusReportingService(serviceRegistry, operationsClient, "statusPane", "notifications", "notificationArea"); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
        new mProgress.ProgressService(serviceRegistry, operationsClient, commandRegistry);
        mGlobalCommands.generateBanner("orion-mesaTable", serviceRegistry, commandRegistry, preferences, searcher); //$NON-NLS-0$
        mGlobalCommands.setPageTarget({task: "Mesa Table View", serviceRegistry: serviceRegistry, commandService: commandRegistry});

        var thisURL = window.location.href;
        var fileLocation = thisURL.substring(thisURL.lastIndexOf("#") + 1, thisURL.length);
        var repoLocation = thisURL.substring(thisURL.indexOf("/file/"), thisURL.lastIndexOf("#"));
        var tableName = fileLocation.substring(fileLocation.lastIndexOf("/") + 1, fileLocation.indexOf(".mesa"));

        //mesaClient.getChangedFileStatus(repoLocation.substring(0, repoLocation.length)).then(function(changedFiles) {
        var changedFiles = {};
            var data = {
                "fileReplacements": changedFiles
            };

            console.log(data);

            xhr("POST", "http://localhost:3302/v6/datatable/ui/tables/" + tableName + "/preview", {
                "data": JSON.stringify(data),
                "headers": {"Content-Type": "application/json; charset=UTF-8", "Access-Control-Allow-Origin": "http://localhost:8585"}
            }).then(function(result) {
                console.log("Building table");
                var tableData = JSON.parse(result.response);
    
                var mesaTableDiv = document.getElementById("mesaTable");
                var mesaTableTable = document.createElement("table");
                mesaTableTable.className = "mesaTable";
                mesaTableDiv.appendChild(mesaTableTable);

                var columns = tableData.header.columns;
                var headingRow = document.createElement("thead");
                headingRow.className = "mesa-table-header";
                var headingRowHTML = "";
                for (var i = 0; i < columns.length; i++) {
                    headingRowHTML += "<th>" + columns[i][0] + "<br/><span class='mesa-table-header-type'>" + columns[i][1] + "</span></th>";
                }
                headingRow.innerHTML = headingRowHTML;
                mesaTableTable.appendChild(headingRow);

                var contents = tableData.contents;
                var row;
                var rowHTML = "";
                for (var i =0; i < contents.length; i++) {
                    row = contents[i];
                    for (var j=0; j < row.length; j++) {
                        rowHTML += "<td>" + row[j] + "</td>";
                    }
                    mesaTableTable.innerHTML += rowHTML;
                    rowHTML = "";
                }
            //});
        });  // End changedFiles.then
	});
});
