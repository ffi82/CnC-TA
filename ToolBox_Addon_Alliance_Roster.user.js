// ==UserScript==
// @name           ToolBox_Addon_Alliance_Roster
// @author         ffi82
// @description    Export the Alliance Roster.
// @version        0.3
// @namespace      https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @include        https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @icon           https://eaassets-a.akamaihd.net/cncalliancesgame/cdn/data/254d274a83ddd44d9bea525f6c4010d1.png
// @updateURL      https://github.com/ffi82/CnC-TA/raw/master/ToolBox_Addon_Alliance_Roster.user.js
// @contributor    Sral214
// @grant          none
// ==/UserScript==
(function(){
    var injectFunction = function() {
        function createClass()
        {
            qx.Class.define("ToolBox_Alliance_Roster",
                            {
                type: "singleton",
                extend: qx.core.Object,
                construct: function()
                {
                    try
                    {
                        var ToolBoxMainWindow = window.ToolBoxMain.getInstance().ToolBoxFenster;
                        var Alliance_Roster_Button = new qx.ui.form.Button("Alliance Roster","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAAXNSR0IArs4c6QAABC9JREFUSEu91m1MW1UYB/D/01Ja2kJ5mSOIyEsrAl3UyTaQwNgmIjAYQ5gbAqG8TJCGGedGN5YZx1zQsIRlJohmJmOJZIthYcxkHxY/sMwZwwj6wbdssCBoaeWlvHUt7T3HFJxBWKFg4vl2c895fve559znuYT/YdBSg4/8oIC/fzDI28cj3z7pxJDwgLTaOXfzlyNTP+eAP3zfOj2mFgTnsvuLA0m8RJD5R1oA0duk0HR6jlgH69hYt+HWV5/7TE1Z4ArkbjBOSMyooiD1q/1gQhkp1D2Pm7s8E/vIMedv7YaWc03em+LU8A1Nemw2nM2h91YnV8jFKKpuYOKNKTdhnzGQKu7eUmhFpFR3gFTaWguY7deFhdwJwA6OIHBHdFdrjez2nR6kJMdTTnnjDOSaNtinGkmlHV8MrYyUl5BK+84siBnnFzFhFtx2GUSjYOxEV0tF+O1vvoNM6o1XduciZW+9GRL5GcgGLxLtdD3Q/Fgdiczixu8vcrFYDN9gLXxC0r6FWHoDxEu7Wio1LkQuk0Am90F2QSU27dL3Q5gzkEJzw2NEuUGDutoazgWOHRnZ2FN8vA8S/+sgvPHleZ2mt6fP9RrBBI7QkA04cNBAwdqCwyR7qnV1pLnJu7SihHw3xqLhqJ47nAJS01+j9MJjdwDZBRB7CzM/xcM2NB/LPGIUdbS3ce1L+2j7Hv1hUsSsjjR/9KH3wWod+T2dhlO1uXxujiEjv4hS8+rvQSTpAGfxINE2kMgLBPpz6Bf5tZYyHr01bx1IRCZO6bO4w8GQWaCj5MxyNm56wGw2O4gWtlSp9IOdK7zWj2j20wf6VDY5LWBfcQUSknfQYN9lWCyuU7qAhIZFAU++jvUjMVVorHmRm8ad0FW+SS9sTcLA3S8wMTEBVyJOp4CIqGiIwwr/AxKnR6shkRtNsygsq6bYLWmY6r9GttnR+Uw4Y1AFhfEZv4y1Idb+S4Yzp5ukR2rzEbD5BCbvt0OwWaAM2QbutNLdm5/y4WEjf3RE1dGxFJ5Qu0bkfpvhdMNZ6dEjZVCFp+F4VTYXccKunP2UnlsCx8jXJHLOcBKJF75oZRhG2fO4+rGOa+Jz6eX8Q6sfYesj5N1SBETtRsdndYwI9FxCDsKjNNR9vRVG0xgXixcqdESkmqKT9eg4X8qf2bJ3jcihPATGvycANLlQH5kAYcYLgk3x70pLZDabJFeaS3hcYsE6kM0GG5ht+O8qbAcXeYMQsAQRmf8YCLxyrmxtSP3Js9KdCVFcFZFKYG476z91dtIygd7uqzw1q9izTJy/dxouXfhE+nB6FBKJ+864OBtB4BB7SbA9oxgxSUWrbLx1oADOsZMTZlO4w+FYsccv7YCudqD0f8ImlQfWkfLZNvdVmP+ohN03GCSRLQ3i2bWdwcqNFOD6wXDTtDwLtLZZfwE3uTs4z03V4gAAAABJRU5ErkJggg==").set({
                            toolTipText: "Exports the Alliance Roster to a csv file.",
                            width: 140,
                            height: 25,
                            maxWidth: 140,
                            maxHeight: 25,
                        });
                        Alliance_Roster_Button.addListener("click", function (e) {
                            var allmembers = ClientLib.Data.MainData.GetInstance().get_Alliance().get_MemberDataAsArray();
                            var membercount = ClientLib.Data.MainData.GetInstance().get_Alliance().get_NumMembers();
                            var dateitext = "";
                            dateitext += "ActiveState;AvgDefenseLvl;AvgOffenseLvl;Bases;BestDefenseLvl;BestOffenseLvl;Faction;HasControlHubCode;Id;JoinStep;LastSeen;Level;Name;OnlineState;Points;Rank;Role;RoleName;VeteranPointContribution\r\n"
                            for (var l = membercount - 1; l >= 0; l--) {
                                var tempmember = allmembers[l];
                                dateitext +=
                                    tempmember.ActiveState + ";" +
                                    tempmember.AvgDefenseLvl + ";" +
                                    tempmember.AvgOffenseLvl + ";" +
                                    tempmember.Bases + ";" +
                                    tempmember.BestDefenseLvl + ";" +
                                    tempmember.BestOffenseLvl + ";" +
                                    tempmember.Faction + ";" +
                                    tempmember.HasControlHubCode + ";" +
                                    tempmember.Id + ";" +
                                    tempmember.JoinStep + ";" +
                                    tempmember.LastSeen + ";" +
                                    tempmember.Level + ";" +
                                    tempmember.Name + ";" +
                                    tempmember.OnlineState + ";" +
                                    tempmember.Points + ";" +
                                    tempmember.Rank + ";" +
                                    tempmember.Role + ";" +
                                    tempmember.RoleName + ";" +
                                    tempmember.VeteranPointContribution + "\r\n"
                            }
                            var elLink = document.createElement("a");
                            var oBlob = new Blob([ dateitext ], { type: "text/plain" });
                            elLink.download = new Date().toISOString().slice(0,-14) + "_" + ClientLib.Data.MainData.GetInstance().get_Server().get_WorldId() + "_" + ClientLib.Data.MainData.GetInstance().get_Alliance().get_Abbreviation() + "_Roster.csv";
                            var oLastUrl = window.URL.createObjectURL(oBlob);
                            elLink.href = oLastUrl;
                            document.body.appendChild(elLink);
                            elLink.click();
                            document.body.removeChild(elLink);
                            delete elLink;
                        }, this);
                        ToolBoxMainWindow.add(Alliance_Roster_Button);
                    }
                    catch (e) {
                        console.log("Alliance_Roster Error: ");
                        console.log(e.toString());
                    }
                    console.log("Alliance_Roster loaded successfully");
                },
                destruct: function()
                {
                },
                members:
                {
                }
            });
        }
        function waitForGame()
        {
            try
            {
                if (typeof qx != 'undefined' && typeof qx.core != 'undefined' && typeof qx.core.Init != 'undefined' && qx.core.Init.getApplication() !== null && typeof window.ToolBoxMain != 'undefined')
                {
                    var app = qx.core.Init.getApplication();
                    if (app.initDone === true && typeof window.ToolBoxMain != 'undefined')
                    {
                        try
                        {
                            createClass();
                            //console.log("Creating phe.cnc function wraps");
                            if (typeof phe.cnc.Util.attachNetEvent == 'undefined')
                            {
                                ToolBox_Alliance_Roster.attachNetEvent = webfrontend.gui.Util.attachNetEvent;
                                ToolBox_Alliance_Roster.detachNetEvent = webfrontend.gui.Util.detachNetEvent;
                            }
                            else
                            {
                                ToolBox_Alliance_Roster.attachNetEvent = phe.cnc.Util.attachNetEvent;
                                ToolBox_Alliance_Roster.detachNetEvent = phe.cnc.Util.detachNetEvent;
                            }
                            if (typeof phe.cnc.gui.util == 'undefined')
                                ToolBox_Alliance_Roster.getInstance().formatNumbersCompact = webfrontend.gui.Util.formatNumbersCompact;
                            else
                                ToolBox_Alliance_Roster.getInstance().formatNumbersCompact = phe.cnc.gui.util.Numbers.formatNumbersCompact;
                            ToolBox_Alliance_Roster.getInstance();
                        }
                        catch(e)
                        {
                            console.log("ToolBox_Addon_Alliance_Roster waitforgame Error:");
                            console.log(e);
                        }
                    }
                    else window.setTimeout(waitForGame, 1000);
                }
                else
                {
                    window.setTimeout(waitForGame, 1000);
                }
            }
            catch (e)
            {
                if (typeof console != 'undefined') console.log(e);
                else if (window.opera) opera.postError(e);
                else GM_log(e);
            }
        }
        window.setTimeout(waitForGame, 1000);
    };
    var script = document.createElement("script");
    var txt = injectFunction.toString();
    script.innerHTML = "(" + txt + ")();";
    script.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(script);
})();
