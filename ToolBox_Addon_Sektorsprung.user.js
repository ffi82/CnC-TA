// ==UserScript==
// @name           ToolBox_Addon_Sektorsprung
// @author         Trinitroglycerol
// @contributor    leo7044 (https://github.com/leo7044)
// @description    Landepunkt für Spieler berechnen
// @include        https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @downloadURL    https://raw.githubusercontent.com/leo7044/CnC_TA/master/ToolBox_Addon_Sektorsprung.user.js
// @updateURL      https://raw.githubusercontent.com/leo7044/CnC_TA/master/ToolBox_Addon_Sektorsprung.user.js
// @version        0.1.3.2 Beta
// @grant          none
// ==/UserScript==

(function(){
	var injectFunction = function()
	{
		function createClass()
		{
			qx.Class.define("ToolBox_Addon_Sektorsprung",
							{
				type: "singleton",
				extend: qx.core.Object,

				construct: function()
				{
					try
					{
						var app = qx.core.Init.getApplication();
						var chat = ClientLib.Data.MainData.GetInstance().get_Chat();
						var server = ClientLib.Data.MainData.GetInstance().get_Server();
						var erneuern = true;
						var chatkanal = "/a ";
						var ToolBoxMainFenster = window.ToolBoxMain.getInstance().ToolBoxFenster;
						var SektorsprungButton = new qx.ui.form.Button("Sektorsprung").set({
							toolTipText: "Hauptmenü",
							width: 140,
							height: 25,
							maxWidth: 140,
							maxHeight: 25,
						});
						SektorsprungButton.addListener("click", function (e) {
							if(SektorsprungFenster.getVisibility() == "hidden") {
								SektorsprungFenster.setVisibility("visible");
								SektorsprungFenster.setActive(true);
								SektorsprungFenster.setAlwaysOnTop(true);
							} else {
								SektorsprungFenster.setVisibility("hidden");
								SektorsprungFenster.setActive(false);
								SektorsprungFenster.setAlwaysOnTop(false);
							}
						}, this);
						ToolBoxMainFenster.add(SektorsprungButton);

						var SektorsprungFenster = new qx.ui.window.Window("Sektorsprung").set({
							showMaximize:false,
							showMinimize:false,
							showClose:true,
							allowClose:true,
							resizable:false,
						});
						SektorsprungFenster.setLayout(new qx.ui.layout.Flow());
						SektorsprungFenster.setTextColor("#FFFFFF");
						SektorsprungFenster.setVisibility("hidden");
						app.getDesktop().add(SektorsprungFenster, {
							left: 130,
							top: 150
						});

						var NameLable = new qx.ui.basic.Label("Name: ").set({
							margin : 5,
							width: 45,
							minWidth: 45,
							maxWidth: 45,
						});
						SektorsprungFenster.add(NameLable);
						var Name = new qx.ui.form.TextField("").set({
							width: 150,
							minWidth: 150,
							maxWidth: 150,
						});
						SektorsprungFenster.add(Name);
						var spielernamen = [];
						var anzahl = 0;
						var text = "";
						var starten = new qx.ui.form.Button("Suche starten").set({
							toolTipText: "Suche starten",
							width: 100,
							height: 25,
							maxWidth: 100,
							maxHeight: 25,
							marginLeft: 5
						});
						starten.addListener("click", function (e) {
							if (erneuern) {
								ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("RankingGetCount", {
									view: ClientLib.Data.Ranking.EViewType.Player,
									rankingType: ClientLib.Data.Ranking.ERankingType.Score
								}, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, anzahlerneuern), null);
							} else {
								spielerfinden(spielernamen);
							}
						}, this);
						var anzahlerneuern = function(context, data) {
							anzahl = data;
							ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("RankingGetData", {
								ascending: ClientLib.Data.Ranking.ESortDirection.Ascending,
								firstIndex: 0,
								lastIndex: anzahl,
								rankingType: ClientLib.Data.Ranking.ERankingType.Score,
								sortColumn: ClientLib.Data.Ranking.ESortColumn.PlayerName,
								view: ClientLib.Data.Ranking.EViewType.Player
							}, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, ranglistennamen), null);
						};
						var ranglistennamen = function(context, data) {
							for (var k = 0; k < data.p.length; k++) {
								spielernamen.push(data.p[k].pn);
							}
							spielerfinden(spielernamen);
						};
						var spielerfinden = function(spielernamen) {
							var gefSpieler = "";
							erneuern = false;
							if (spielernamen.length > 0 && Name.getValue() !== "") {
								for (var l = 0; l < spielernamen.length; l++) {
									var regexname = new RegExp(Name.getValue().toLowerCase(), "g");
									if(regexname.test(spielernamen[l].toLowerCase())) {
										if (gefSpieler === "") {
											gefSpieler = spielernamen[l];
										} else if (spielernamen[l].length < gefSpieler.length) {
											gefSpieler = spielernamen[l];
										}
									}
								}
							} else {
								gefSpieler = "";
							}
							if (gefSpieler !== "") {
								berechnen.setEnabled(true);
								Spieler.setValue(gefSpieler);
							} else {
								berechnen.setEnabled(false);
								Spieler.setValue("");
							}
						};
						SektorsprungFenster.add(starten);
						var refresh = new qx.ui.form.Button("refresh Rangliste").set({
							toolTipText: "rangliste manuell refreshen",
							width: 120,
							height: 25,
							maxWidth: 120,
							maxHeight: 25,
							marginLeft: 5
						});
						refresh.addListener("click", function (e) {
							erneuern = true;
						}, this);
						SektorsprungFenster.add(refresh);
						var Allichat = new qx.ui.form.RadioButton("Allianzchat").set({
							width: 100,
							minWidth: 100,
							maxWidth: 100,
							marginLeft: 5
						});
						Allichat.addListener("click", function () {
							chatkanal = "/a ";
						}, this);
						SektorsprungFenster.add(Allichat, {lineBreak: true});
						var SpielerLable = new qx.ui.basic.Label("gefundener Spieler: ").set({
							margin : 5,
							width: 115,
							minWidth: 115,
							maxWidth: 115,
						});
						SektorsprungFenster.add(SpielerLable);
						var Spieler = new qx.ui.form.TextField("").set({
							width: 150,
							minWidth: 150,
							maxWidth: 150,
							readOnly: true
						});
						SektorsprungFenster.add(Spieler);

						var berechnen = new qx.ui.form.Button("Landepunkte berechnen").set({
							toolTipText: "Berechnen der Landepunkte für den gefundenen Spieler",
							width: 150,
							height: 25,
							maxWidth: 150,
							maxHeight: 25,
							marginLeft: 5,
							enabled: false,
						});
						berechnen.addListener("click", function (e) {
							if (Spieler.getValue() !== "")
							{
								ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("GetPublicPlayerInfoByName", {
									name: Spieler.getValue()
								}, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, landepunktbestimmung), null);
							}
						}, this);
						SektorsprungFenster.add(berechnen);
						var Offichat = new qx.ui.form.RadioButton("Offizierschat").set({
							width: 100,
							minWidth: 100,
							maxWidth: 100,
							marginLeft: 10
						});
						Offichat.addListener("click", function () {
							chatkanal = "/o ";
						}, this);
						SektorsprungFenster.add(Offichat, {lineBreak: true});
						var RadioGroup = new qx.ui.form.RadioGroup();
						RadioGroup.add(Allichat, Offichat);
						var landepunktbestimmung = function(context, data) {
							var Mx = textfields[8].getValue();
							var My = textfields[9].getValue();
							var distanz = 0;
							var sektorwinkel = 0;
							for (var i = 0; i < data.c.length; i++) {
								distanz += Math.sqrt(Math.pow(Math.abs(data.c[i].x-Mx),2) + Math.pow(Math.abs(data.c[i].y-My),2));
							}
							distanz = (distanz/data.c.length)+30;
							for (var j = 0; j < 8; j++)
							{
								var x = parseInt(Mx) + Math.sin(sektorwinkel*(Math.PI/180))*distanz;
								var y = parseInt(My) - Math.cos(sektorwinkel*(Math.PI/180))*distanz;
								textfields[j].setValue(x.toFixed(0) + ":" + y.toFixed(0));
								sektorwinkel += 45;
							}
						};
						var buttons = [];
						var sektornamen =
							[
								"Norden",
								"Nord-Osten",
								"Osten",
								"Süd-Osten",
								"Süden",
								"Süd-Westen",
								"Westen",
								"Nord-Westen",
								"Mitte"
							];
						for (var i = 0; i < 9; i++)
						{
							buttons.push(new qx.ui.form.Button().set({
								width: 150,
								height: 25,
								maxWidth: 150,
								maxHeight: 25,
								label: sektornamen[i]
							})
										);
						}
						var textfields = [];
						for (var j = 0; j < 10; j++) {
							textfields.push(new qx.ui.form.TextField().set({
								width: 150,
								height: 25,
								maxWidth: 150,
								maxHeight: 25,
								textAlign: "center",
								readOnly: true,
								value: "N/A"
							}));
							if (j == 8 || j == 9) {
								var mitteX = (server.get_WorldWidth()/2) + "";
								var mitteY = (server.get_WorldHeight()/2) + "";
								textfields[j].setReadOnly(false);
								textfields[j].setMaxLength(3);
								textfields[j].setFilter(/[0-9]/);
								if (j == 8) {
									textfields[j].setValue(mitteX);
								} else {
									textfields[j].setValue(mitteY);
								}
							}
						}
						buttons[0].addListener("click", function () {
							chat.AddMsg(chatkanal + "Vorraussichtlicher Landepunkt von [player]" + Spieler.getValue() + "[/player] im " + buttons[0].getLabel() + ": [coords]" + textfields[0].getValue() + "[/coords]");
						}, this);
						buttons[1].addListener("click", function () {
							chat.AddMsg(chatkanal + "Vorraussichtlicher Landepunkt von [player]" + Spieler.getValue() + "[/player] im " + buttons[1].getLabel() + ": [coords]" + textfields[1].getValue() + "[/coords]");
						}, this);
						buttons[2].addListener("click", function () {
							chat.AddMsg(chatkanal + "Vorraussichtlicher Landepunkt von [player]" + Spieler.getValue() + "[/player] im " + buttons[2].getLabel() + ": [coords]" + textfields[2].getValue() + "[/coords]");
						}, this);
						buttons[3].addListener("click", function () {
							chat.AddMsg(chatkanal + "Vorraussichtlicher Landepunkt von [player]" + Spieler.getValue() + "[/player] im " + buttons[3].getLabel() + ": [coords]" + textfields[3].getValue() + "[/coords]");
						}, this);
						buttons[4].addListener("click", function () {
							chat.AddMsg(chatkanal + "Vorraussichtlicher Landepunkt von [player]" + Spieler.getValue() + "[/player] im " + buttons[4].getLabel() + ": [coords]" + textfields[4].getValue() + "[/coords]");
						}, this);
						buttons[5].addListener("click", function () {
							chat.AddMsg(chatkanal + "Vorraussichtlicher Landepunkt von [player]" + Spieler.getValue() + "[/player] im " + buttons[5].getLabel() + ": [coords]" + textfields[5].getValue() + "[/coords]");
						}, this);
						buttons[6].addListener("click", function () {
							chat.AddMsg(chatkanal + "Vorraussichtlicher Landepunkt von [player]" + Spieler.getValue() + "[/player] im " + buttons[6].getLabel() + ": [coords]" + textfields[6].getValue() + "[/coords]");
						}, this);
						buttons[7].addListener("click", function () {
							chat.AddMsg(chatkanal + "Vorraussichtlicher Landepunkt von [player]" + Spieler.getValue() + "[/player] im " + buttons[7].getLabel() + ": [coords]" + textfields[7].getValue() + "[/coords]");
						}, this);
						buttons[8].addListener("click", function () {
							chat.AddMsg(chatkanal + "Mitte: [coords]" + textfields[8].getValue() + ":" + textfields[9].getValue() + "[/coords]");
						}, this);

						var layout = new qx.ui.layout.Grid();
						layout.setColumnWidth(0, 75);
						layout.setColumnWidth(1, 100);
						layout.setColumnWidth(2, 50);
						layout.setColumnWidth(3, 100);
						layout.setColumnWidth(4, 50);
						layout.setColumnWidth(5, 100);
						layout.setColumnWidth(6, 75);
						var container = new qx.ui.container.Composite(layout).set({
							marginTop: 5,
							marginBottom: 5
						});
						container.add(buttons[0], { row: 0, column: 3 });

						container.add(buttons[7], { row: 1, column: 1 });
						container.add(textfields[0], { row: 1, column: 3 });
						container.add(buttons[1], { row: 1, column: 5 });

						container.add(textfields[7], { row: 2, column: 1 });
						container.add(textfields[1], { row: 2, column: 5 });

						container.add(textfields[8], { row: 3, column: 3 });

						container.add(buttons[6], { row: 4, column: 0 });
						container.add(textfields[6], { row: 4, column: 1 });
						container.add(buttons[8], { row: 4, column: 3 });
						container.add(textfields[2], { row: 4, column: 5 });
						container.add(buttons[2], { row: 4, column: 6 });

						container.add(textfields[9], { row: 5, column: 3 });

						container.add(textfields[5], { row: 6, column: 1 });
						container.add(textfields[3], { row: 6, column: 5 });

						container.add(buttons[5], { row: 7, column: 1 });
						container.add(textfields[4], { row: 7, column: 3 });
						container.add(buttons[3], { row: 7, column: 5 });

						container.add(buttons[4], { row: 8, column: 3 });

						SektorsprungFenster.add(container, {lineBreak: true});
						var statuslabel = new qx.ui.basic.Label("Status: ").set({
							margin : 5,
							width: 45,
							minWidth: 45,
							maxWidth: 45,
						});
						//SektorsprungFenster.add(statuslabel);
						var status = new qx.ui.form.TextField("").set({
							width: 450,
							minWidth: 450,
							maxWidth: 450,
							//height: 300,
							readOnly: true,
						});
						//SektorsprungFenster.add(status);

					}
					catch (e)
					{
						console.log("ToolBox_Addon_Sektorsprung Error: ");
						console.log(e.toString());
					}
					console.log("ToolBox_Addon_Sektorsprung loaded successfully");
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

							//console.log("Creating webfrontend.phe.cnc function wraps");

							if (typeof webfrontend.phe.cnc.Util.attachNetEvent == 'undefined')
							{
								ToolBox_Addon_Sektorsprung.getInstance().attachNetEvent = webfrontend.gui.Util.attachNetEvent;
								ToolBox_Addon_Sektorsprung.getInstance().detachNetEvent = webfrontend.gui.Util.detachNetEvent;
							}
							else
							{
								ToolBox_Addon_Sektorsprung.getInstance().attachNetEvent = webfrontend.phe.cnc.Util.attachNetEvent;
								ToolBox_Addon_Sektorsprung.getInstance().detachNetEvent = webfrontend.phe.cnc.Util.detachNetEvent;
							}

							if (typeof webfrontend.phe.cnc.gui.util == 'undefined')
								ToolBox_Addon_Sektorsprung.getInstance().formatNumbersCompact = webfrontend.gui.Util.formatNumbersCompact;
							else
								ToolBox_Addon_Sektorsprung.getInstance().formatNumbersCompact = webfrontend.phe.cnc.gui.util.Numbers.formatNumbersCompact;

							ToolBox_Addon_Sektorsprung.getInstance();
						}
						catch(e)
						{
							console.log("ToolBox_Addon_Sektorsprung waitforgame Error:");
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
