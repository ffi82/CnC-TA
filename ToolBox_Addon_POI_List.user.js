// ==UserScript==
// @name           ToolBox_Addon_POI_List
// @author         ffi82
// @description    Zoom out to Export POI Data while in world view.
// @version        0.5
// @namespace      https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @include        https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @icon           https://eaassets-a.akamaihd.net/cncalliancesgame/cdn/data/239cf2e67b8ceffc9956c76050a16af2.png
// @updateURL      https://github.com/ffi82/CnC-TA/raw/master/ToolBox_Addon_POI_List.user.js
// @contributor    Sral214
// @grant          none
// ==/UserScript==
(function() {
    var injectFunction = function() {
        function createClass() {
            qx.Class.define("ToolBox_POI", {
                type: "singleton",
                extend: qx.core.Object,
                construct: function() {
                    try {
                        var ToolBoxMainFenster = window.ToolBoxMain.getInstance().ToolBoxFenster;
                        var POIButton = new qx.ui.form.Button("POI list","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAAXNSR0IArs4c6QAABC9JREFUSEu91m1MW1UYB/D/01Ja2kJ5mSOIyEsrAl3UyTaQwNgmIjAYQ5gbAqG8TJCGGedGN5YZx1zQsIRlJohmJmOJZIthYcxkHxY/sMwZwwj6wbdssCBoaeWlvHUt7T3HFJxBWKFg4vl2c895fve559znuYT/YdBSg4/8oIC/fzDI28cj3z7pxJDwgLTaOXfzlyNTP+eAP3zfOj2mFgTnsvuLA0m8RJD5R1oA0duk0HR6jlgH69hYt+HWV5/7TE1Z4ArkbjBOSMyooiD1q/1gQhkp1D2Pm7s8E/vIMedv7YaWc03em+LU8A1Nemw2nM2h91YnV8jFKKpuYOKNKTdhnzGQKu7eUmhFpFR3gFTaWguY7deFhdwJwA6OIHBHdFdrjez2nR6kJMdTTnnjDOSaNtinGkmlHV8MrYyUl5BK+84siBnnFzFhFtx2GUSjYOxEV0tF+O1vvoNM6o1XduciZW+9GRL5GcgGLxLtdD3Q/Fgdiczixu8vcrFYDN9gLXxC0r6FWHoDxEu7Wio1LkQuk0Am90F2QSU27dL3Q5gzkEJzw2NEuUGDutoazgWOHRnZ2FN8vA8S/+sgvPHleZ2mt6fP9RrBBI7QkA04cNBAwdqCwyR7qnV1pLnJu7SihHw3xqLhqJ47nAJS01+j9MJjdwDZBRB7CzM/xcM2NB/LPGIUdbS3ce1L+2j7Hv1hUsSsjjR/9KH3wWod+T2dhlO1uXxujiEjv4hS8+rvQSTpAGfxINE2kMgLBPpz6Bf5tZYyHr01bx1IRCZO6bO4w8GQWaCj5MxyNm56wGw2O4gWtlSp9IOdK7zWj2j20wf6VDY5LWBfcQUSknfQYN9lWCyuU7qAhIZFAU++jvUjMVVorHmRm8ad0FW+SS9sTcLA3S8wMTEBVyJOp4CIqGiIwwr/AxKnR6shkRtNsygsq6bYLWmY6r9GttnR+Uw4Y1AFhfEZv4y1Idb+S4Yzp5ukR2rzEbD5BCbvt0OwWaAM2QbutNLdm5/y4WEjf3RE1dGxFJ5Qu0bkfpvhdMNZ6dEjZVCFp+F4VTYXccKunP2UnlsCx8jXJHLOcBKJF75oZRhG2fO4+rGOa+Jz6eX8Q6sfYesj5N1SBETtRsdndYwI9FxCDsKjNNR9vRVG0xgXixcqdESkmqKT9eg4X8qf2bJ3jcihPATGvycANLlQH5kAYcYLgk3x70pLZDabJFeaS3hcYsE6kM0GG5ht+O8qbAcXeYMQsAQRmf8YCLxyrmxtSP3Js9KdCVFcFZFKYG476z91dtIygd7uqzw1q9izTJy/dxouXfhE+nB6FBKJ+864OBtB4BB7SbA9oxgxSUWrbLx1oADOsZMTZlO4w+FYsccv7YCudqD0f8ImlQfWkfLZNvdVmP+ohN03GCSRLQ3i2bWdwcqNFOD6wXDTtDwLtLZZfwE3uTs4z03V4gAAAABJRU5ErkJggg==").set( {
                                toolTipText: "Exports the region/world POI list to a csv file. Fist click  on >>>Bird's Eye View<<< for a complete list.",
                                width: 140,
                                height: 25,
                                maxWidth: 140,
                                maxHeight: 25,
                            });
                        POIButton.addListener("click", function (e) {
                            if (qx.core.Init.getApplication().getPlayArea().getViewMode() != 0) {
                                alert("Set view mode to Region.");
                                qx.core.Init.getApplication().showMainOverlay(!1);
                            }
                            else {
                                if (ClientLib.Vis.VisMain.GetInstance().get_Region().get_ZoomFactor() != 0.01) {
                                    alert("Set max zoom (0.01).\nYour current zoom: "+ClientLib.Vis.VisMain.GetInstance().get_Region().get_ZoomFactor());
                                    ClientLib.Vis.VisMain.GetInstance().get_Region().set_ZoomFactor(0.01);
                                    if (ClientLib.Vis.VisMain.GetInstance().get_Region().get_ZoomFactor() != 0.01) {if (confirm("Get 'Tiberium alliances Zoom' userscript to be able to zoom out further in region view.")) {open("https://github.com/ffi82/CnC-TA/raw/master/Tiberium%20Alliances%20Zoom.user.js")}}
                                }
                                else {
                                    var range = ClientLib.Data.MainData.GetInstance().get_Server().get_ContinentWidth();
                                    var x = ClientLib.Data.MainData.GetInstance().get_Server().get_ContinentWidth();
                                    var y = ClientLib.Data.MainData.GetInstance().get_Server().get_ContinentHeight();
                                    var region = ClientLib.Vis.VisMain.GetInstance().get_Region();
                                    var POIScore = []; for (var a = 0; a <= ClientLib.Data.MainData.GetInstance().get_Server().get_MaxCenterLevel(); a++) {POIScore [a] = ClientLib.Base.PointOfInterestTypes.GetScoreByLevel(a);}
                                    //var POIRank = []; for (var b = 0; b < 42; b++) {POIRank [b] = ClientLib.Base.PointOfInterestTypes.GetBoostModifierByRank();}
                                    var Reactor  = new Array();
                                    var Tiberium = new Array();
                                    var Crystal = new Array();
                                    var Tungsten = new Array();
                                    var Uranium = new Array();
                                    var Aircraft = new Array();
                                    var Resonator = new Array();
                                    var AllPOIs = new Array();
                                    var output = "";
                                    //output += ClientLib.Data.MainData.GetInstance().get_Server().get_Name() + "," + new Date().toLocaleString() + "\n"
                                    output += "level,name,coord_x,coord_y,alliance,score,type\r\n"
                                    for (var i = x - (range); i < (x+range); i++) {
                                        for (var j = y - range; j < (y+range); j++) {
                                            var visObject = region.GetObjectFromPosition(i * region.get_GridWidth(),j * region.get_GridHeight());
                                            if(visObject != null) {
                                                try {
                                                    if (visObject.get_VisObjectType() == ClientLib.Vis.VisObject.EObjectType.RegionPointOfInterest) {
                                                        var visObjectName = visObject.get_Name();
                                                        if(visObjectName == 'Tunnel exit') {}
                                                        else {
                                                            var POIlevel = visObject.get_Level();
                                                            var POItype = visObject.get_Type();
                                                            var Alliance = visObject.get_OwnerAllianceName();
                                                            var visObjectShortName = visObjectName.split(' ')[0];
                                                            var POIdata = POIlevel + ',' + visObjectShortName + ',' + i + ',' + j + ',' + Alliance + ',' + POIScore[POIlevel] + ',' + POItype;
                                                            AllPOIs.push(POIdata);
                                                            if(visObjectShortName == "Aircraft") { Aircraft.push(POIdata); }
                                                            if(visObjectShortName == "Uranium") { Uranium.push(POIdata); }
                                                            if(visObjectShortName == "Tungsten") { Tungsten.push(POIdata); }
                                                            if(visObjectShortName == "Tiberium") { Tiberium.push(POIdata); }
                                                            if(visObjectShortName == "Reactor") { Reactor.push(POIdata); }
                                                            if(visObjectShortName == "Crystal") { Crystal.push(POIdata); }
                                                            if(visObjectShortName == "Resonator") { Resonator.push(POIdata); }
                                                        }
                                                    }
                                                }
                                                catch (e) { console.log(e); }
                                            }
                                        }
                                    }
                                    Aircraft.sort().reverse();
                                    Uranium.sort().reverse();
                                    Tungsten.sort().reverse();
                                    Tiberium.sort().reverse();
                                    Reactor.sort().reverse();
                                    Crystal.sort().reverse();
                                    Resonator.sort().reverse();
                                    for (var key in Aircraft) { output += Aircraft[key] + "\n"}
                                    for (key in Uranium) { output += Uranium[key] + "\n"}
                                    for (key in Tungsten) { output += Tungsten[key] + "\n"}
                                    for (key in Tiberium) { output += Tiberium[key] + "\n"}
                                    for (key in Reactor) { output += Reactor[key] + "\n"}
                                    for (key in Crystal) { output += Crystal[key] + "\n"}
                                    for (key in Resonator) { output += Resonator[key] + "\n"}
                                    var elLink = document.createElement("a");
                                    var oBlob = new Blob([ output ], { type: "text/plain" });
                                    elLink.download = new Date().toISOString().slice(0,-14) + "_" + ClientLib.Data.MainData.GetInstance().get_Server().get_WorldId() + "_POI.csv";
                                    var oLastUrl = window.URL.createObjectURL(oBlob);
                                    elLink.href = oLastUrl;
                                    document.body.appendChild(elLink);
                                    elLink.click();
                                    document.body.removeChild(elLink);
                                    delete elLink;
                                }
                            }
                        }, this);
                        ToolBoxMainFenster.add(POIButton);
                    }
                    catch (e) { console.log("POI list Error: "); console.log(e.toString()); }
                    console.log("POI list loaded successfully");
                },
                destruct: function() {},
                members: {}
            });
        }
        function waitForGame() {
            try {
                if (typeof qx != 'undefined' && typeof qx.core != 'undefined' && typeof qx.core.Init != 'undefined' && qx.core.Init.getApplication() !== null && typeof window.ToolBoxMain != 'undefined') {
                    var app = qx.core.Init.getApplication();
                    if (app.initDone === true && typeof window.ToolBoxMain != 'undefined') {
                        try {
                            createClass();
                            //console.log("Creating phe.cnc function wraps");
                            if (typeof phe.cnc.Util.attachNetEvent == 'undefined') {
                                ToolBox_POI.attachNetEvent = webfrontend.gui.Util.attachNetEvent;
                                ToolBox_POI.detachNetEvent = webfrontend.gui.Util.detachNetEvent;
                            }
                            else {
                                ToolBox_POI.attachNetEvent = phe.cnc.Util.attachNetEvent;
                                ToolBox_POI.detachNetEvent = phe.cnc.Util.detachNetEvent;
                            }
                            if (typeof phe.cnc.gui.util == 'undefined')
                                ToolBox_POI.getInstance().formatNumbersCompact = webfrontend.gui.Util.formatNumbersCompact;
                            else
                                ToolBox_POI.getInstance().formatNumbersCompact = phe.cnc.gui.util.Numbers.formatNumbersCompact;
                            ToolBox_POI.getInstance();
                        }
                        catch(e) { console.log("ToolBox_Addon_POI_List waitforgame Error:"); console.log(e); }
                    }
                    else window.setTimeout(waitForGame, 1000);
                }
                else { window.setTimeout(waitForGame, 1000); }
            }
            catch (e) { if (typeof console != 'undefined') console.log(e); else if (window.opera) opera.postError(e); else GM_log(e); }
        }
        window.setTimeout(waitForGame, 1000);
    };
    var script = document.createElement("script");
    var txt = injectFunction.toString();
    script.innerHTML = "(" + txt + ")();";
    script.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(script);
})();
