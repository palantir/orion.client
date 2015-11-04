/******************************************************************************* 
 * @license
 * Copyright (c) 2013, 2014 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*eslint-env amd, browser*/
/*global URL confirm*/
define([
    "plugins/mesa/mesaClient",
    "plugins/mesa/resourceFormatter",
    "orion/Deferred",
    "orion/fileClient",
	"orion/plugin",
    "orion/serviceregistry",
	"orion/xhr",
    "orion/git/gitClient",
	"orion/URL-shim", // no exports
], function(mMesaClient, resourceFormatter, Deferred, mFileClient, PluginProvider, mServiceregistry, xhr, mGitClient) {
	
	function connect() {
    	console.log("mesaPlugin: starting");
        var serviceRegistry = new mServiceregistry.ServiceRegistry();
        var fileClient = new mFileClient.FileClient(serviceRegistry);
        var gitClient = new mGitClient.GitService(serviceRegistry);
        var mesaClient = new mMesaClient.MesaService(serviceRegistry, fileClient);
    	var headers = {
    		name: "Orion Mesa Support",
    		version: "0.0.1",
    		description: "This plugin provides Mesa Support to the Orion File Service.",
    	};
    	var provider = new PluginProvider(headers);
    
        var serviceImpl = {
            computeProblems: function(editorContext, options) {
                console.log("computeProblems: " + options.title);
                var deferred = new Deferred();
    
                xhr("GET", "http://localhost:8080" + options.title + "?parts=meta", {
                    headers: {"Orion-Version": "1"},
                    timeout: 10000
                }).then(function(result) {
                    var data = JSON.parse(result.response);
                    var repoLocation = resourceFormatter.repoLocationFromCloneLocation(data.Git.CloneLocation);
                    var relativePath = resourceFormatter.fileLocationToId(options.title, repoLocation);
    
                    mesaClient.getChangedFiles(repoLocation).then(function(result) {
                        var data = {
                            "changedFilename": relativePath,
                            "fileReplacements": result,
                            "validateSchema": true
                        };
                        deferred.resolve(data);
                    });
                });
    
                return deferred.then(function(validationData) {
                    var deferred = new Deferred()
                    xhr("POST", "http://localhost:3302/v6/datatable/ui/tables/validate", {
                        "data": JSON.stringify(validationData),
                        "headers": {"Content-Type": "application/json; charset=UTF-8"}
                    }).then(function(response) {
                        var problemArray = JSON.parse(response.responseText)['problems'];
                        var problems = [];
                        for (var index = 0; index < problemArray.length; index++) {
                            var problem = problemArray[index];
                            problems.push({
                                description: problem.message,
                                line: problem.startLine,
                                start: problem.startColumn,
                                end: problem.endColumn,
                                severity: problem.isError ? "error" : "warning"   
                            });
                        }
                        deferred.resolve(problems);
                    });
                    return deferred;
                });
            }
        };
        var serviceProperties = {
          contentType: ["text/x-groovy"] // "text/x-java" doesn't convince orion to use this mode on java files. Need to find out why.
        };
        console.log("mesaPlugin: about to register");
        provider.registerService("orion.edit.validator", serviceImpl, serviceProperties);
    
        // MESA TABLE VIEW
    
        // create new view category in sidebar
        provider.registerServiceProvider("orion.page.link.category", null, {
          id: "mesa",
          name: "Mesa",
          imageClass: "core-sprite-hamburger",  // TODO (dianac): replace sprite
          order: 15
        });
    
        // add the table view page to the view category
        provider.registerServiceProvider("orion.page.link", null, {
          id: "mesa.tableview",
          name: "Mesa Table View",
          category: "mesa",
          order: 10,
          uriTemplate: "{+OrionHome}/mesa/mesa-table.html"
        });
    
        // right-click .mesa files for "Open Related" -> "Mesa Table View"
        // orion.navigate.command for Mesa Table View -- applies to File objects
        provider.registerService("orion.navigate.command", null, {
          id: "mesa.tableview",
          name: "Mesa Table View",
          tooltip: "Open the Mesa Table view for this file",
          validationProperties: [
            { source: "Name", match: "(\.mesa)$" },
            { source: "Location" },
            { source: "Git:CloneLocation", variableName: "GitRepoLocation" }
          ],
          uriTemplate: "{+OrionHome}/mesa/mesa-table.html#{+GitRepoLocation}#{+Location}"
        });
        console.log("mesaPlugin: about to connect");
    	provider.connect();
	}
	
	return {
		connect: connect
	};
});
