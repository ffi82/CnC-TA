// ==UserScript==
// @name           ToolBoxMain
// @author         Trinitroglycerol
// @contributor    leo7044 (https://github.com/leo7044)
// @description    Main menu for the ToolBox Addons
// @include        https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @downloadURL    https://raw.githubusercontent.com/leo7044/CnC_TA/master/ToolBoxMain.user.js
// @updateURL      https://raw.githubusercontent.com/leo7044/CnC_TA/master/ToolBoxMain.user.js
// @version        0.1.2 Beta
// @grant          none
// ==/UserScript==

(function(){
    var injectFunction = function()
    {
        function createClass()
        {
            qx.Class.define("ToolBoxMain",
                            {
                type: "singleton",
                extend: qx.core.Object,
                construct: function()
                {
                    this.createGUI();
                },
                members:
                {
                    app: null,
                    ToolBoxFenster: null,
                    ToolBoxButton: null,

                    createGUI: function () {
                        try
                        {
                            this.app = qx.core.Init.getApplication();

                            //Main menu
                            this.ToolBoxFenster = new qx.ui.window.Window("ToolBox").set({
                                width: 150,
                                maxWidth: 150,
                                minWidth: 150,
                                showMaximize:false,
                                showMinimize:false,
                                showClose:true,
                                allowClose:true,
                                resizable:false,
                            });
                            this.ToolBoxFenster.setLayout(new qx.ui.layout.VBox(5));
                            this.ToolBoxFenster.setTextColor("#000000");
                            this.ToolBoxFenster.setVisibility("hidden");
                            this.ToolBoxFenster.setAlwaysOnTop(false);
                            this.app.getDesktop().add(this.ToolBoxFenster, {
                                left: 130,
                                top: 100
                            });
                            this.ToolBoxButton = new qx.ui.form.Button("ToolBox").set({
                                toolTipText: "Main menu",
                                width: 100,
                                height: 25,
                                maxWidth: 100,
                                maxHeight: 25,
                            });
                            this.ToolBoxButton.addListener("click", function (e) {
                                if(this.ToolBoxFenster.getVisibility() == "hidden") {
                                    this.ToolBoxFenster.setVisibility("visible");
                                    this.ToolBoxFenster.setActive(true);
                                    this.ToolBoxFenster.setAlwaysOnTop(true);
                                } else {
                                    this.ToolBoxFenster.setVisibility("hidden");
                                    this.ToolBoxFenster.setActive(false);
                                    this.ToolBoxFenster.setAlwaysOnTop(false);
                                }
                            }, this);
                            this.app.getDesktop().add(this.ToolBoxButton, {
                                left: 130,
                                top: 30
                            });

                        }
                        catch (e)
                        {
                            console.log("ToolBoxMain Error: ");
                            console.log(e.toString());
                        }
                        console.log("ToolBoxMain loaded successfully");
                    }



                }
            });

        }
        function waitForGame()
        {
            try
            {
                if (typeof qx != 'undefined' && typeof qx.core != 'undefined' && typeof qx.core.Init != 'undefined' && qx.core.Init.getApplication() !== null)
                {
                    var app = qx.core.Init.getApplication();
                    if (app.initDone === true)
                    {
                        try
                        {
                            createClass();

                            //console.log("Creating webfrontend.phe.cnc function wraps");

                            if (typeof webfrontend.phe.cnc.Util.attachNetEvent == 'undefined')
                            {
                                ToolBoxMain.getInstance().attachNetEvent = webfrontend.gui.Util.attachNetEvent;
                                ToolBoxMain.getInstance().detachNetEvent = webfrontend.gui.Util.detachNetEvent;
                            }
                            else
                            {
                                ToolBoxMain.getInstance().attachNetEvent = webfrontend.phe.cnc.Util.attachNetEvent;
                                ToolBoxMain.getInstance().detachNetEvent = webfrontend.phe.cnc.Util.detachNetEvent;
                            }

                            if (typeof webfrontend.phe.cnc.gui.util == 'undefined')
                                ToolBoxMain.getInstance().formatNumbersCompact = webfrontend.gui.Util.formatNumbersCompact;
                            else
                                ToolBoxMain.getInstance().formatNumbersCompact = webfrontend.phe.cnc.gui.util.Numbers.formatNumbersCompact;

                            ToolBoxMain.getInstance();
                        }
                        catch(e)
                        {
                            console.log("ToolBoxMain waitforgame Error:");
                            console.log(e);
                        }
                    }
                    else
                        window.setTimeout(waitForGame, 1000);
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
