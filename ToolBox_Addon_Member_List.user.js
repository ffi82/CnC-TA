// ==UserScript==
// @name           ToolBox_Addon_Member_List
// @author         Lars
// @description    Export the Alliance Roster.
// @include        https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @version        0.2
// @contributor    ffi82
// @grant          none
// ==/UserScript==
(function(){
    var injectFunction = function() {
        function createClass()
        {
            qx.Class.define("ToolBox_MemberList",
                            {
                type: "singleton",
                extend: qx.core.Object,
                construct: function()
                {
                    try
                    {
                        var ToolBoxMainFenster = window.ToolBoxMain.getInstance().ToolBoxFenster;
                        var MemberListButton = new qx.ui.form.Button("Member List").set({
                            toolTipText: "Exports the Alliance Roster to a csv file.",
                            width: 140,
                            height: 25,
                            maxWidth: 140,
                            maxHeight: 25,
                        });
                        MemberListButton.addListener("click", function (e) {
                            var allmembers = ClientLib.Data.MainData.GetInstance().get_Alliance().get_MemberDataAsArray();
                            var membercount = ClientLib.Data.MainData.GetInstance().get_Alliance().get_NumMembers();
                            var dateitext = "";
                            dateitext += "ActiveState;AvgDefenseLvl;AvgOffenseLvl;Bases;BestDefenseLvl;BestOffenseLvl;Faction;HasControlHubCode;Id;JoinStep;LastSeen;Level;Name;OnlineState;Points;Rank;Role;RoleName;VeteranPointContribution\r\n"
                            for (var l = membercount - 1; l >= 0; l--) {
                                var tempmember = allmembers[l];
                                console.log(
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
                                    tempmember.VeteranPointContribution);
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
                            elLink.download = "/MemberList.csv";
                            var oLastUrl = window.URL.createObjectURL(oBlob);
                            elLink.href = oLastUrl;
                            document.body.appendChild(elLink);
                            elLink.click();
                            document.body.removeChild(elLink);
                            delete elLink;
                        }, this);
                        ToolBoxMainFenster.add(MemberListButton);
                    }
                    catch (e) {
                        console.log("MemberList Error: ");
                        console.log(e.toString());
                    }
                    console.log("MemberList loaded successfully");
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
                                ToolBox_MemberList.attachNetEvent = webfrontend.gui.Util.attachNetEvent;
                                ToolBox_MemberList.detachNetEvent = webfrontend.gui.Util.detachNetEvent;
                            }
                            else
                            {
                                ToolBox_MemberList.attachNetEvent = phe.cnc.Util.attachNetEvent;
                                ToolBox_MemberList.detachNetEvent = phe.cnc.Util.detachNetEvent;
                            }
                            if (typeof phe.cnc.gui.util == 'undefined')
                                ToolBox_MemberList.getInstance().formatNumbersCompact = webfrontend.gui.Util.formatNumbersCompact;
                            else
                                ToolBox_MemberList.getInstance().formatNumbersCompact = phe.cnc.gui.util.Numbers.formatNumbersCompact;
                            ToolBox_MemberList.getInstance();
                        }
                        catch(e)
                        {
                            console.log("ToolBox_Addon_MemberList waitforgame Error:");
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
