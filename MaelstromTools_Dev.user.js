// ==UserScript==
// @name        MaelstromTools Dev
// @namespace   MaelstromTools
// @description Just a set of statistics & summaries about repair time and base resources. Mainly for internal use, but you are free to test and comment it.
// @version     0.1.3.0
// @author      Maelstrom, HuffyLuf, KRS_L and Krisan
// @include     http*://prodgame*.alliances.commandandconquer.com/*/index.aspx*
// @grant          none
// ==/UserScript==
//var offense_units = own_city.get_CityArmyFormationsManager().GetFormationByTargetBaseId(current_city.get_Id()).get_ArmyUnits().l;
//System.Int64 GetForumIdByType (ClientLib.Data.Forum.EForumType eForumType)
//static ClientLib.Data.Forum.EForumType NormalForum
//System.Collections.Generic.List$1 get_ForumsAlliance ()
//System.Void CreateThread (System.Int64 forumId ,System.String threadTitle ,System.String threadPost ,System.Boolean autoSubscribe)
//System.Void CreatePost (System.Int64 forumId ,System.Int64 threadId ,System.String postMessage)
//System.Void StartGetForumThreadData (System.Int64 forumId ,System.Int32 skip ,System.Int32 take)
//System.Void OnForumThreadDataReceived (System.Object context ,System.Object result)
//System.Void add_ThreadsFetched (ClientLib.Data.ForumThreadsFetched value)
//System.Void MarkThreadsAsRead (System.Int64 forumId ,System.Int64[] threadIds)
//
//var score = ClientLib.Base.PointOfInterestTypes.GetScoreByLevel(lvl);
//var scoreNext = ClientLib.Base.PointOfInterestTypes.GetNextScore(score);
//var resBonus = ClientLib.Base.PointOfInterestTypes.GetBonusByType(ClientLib.Base.EPOIType.TiberiumBonus, score);
//var unitBonus = ClientLib.Base.PointOfInterestTypes.GetBonusByType(ClientLib.Base.EPOIType.InfanteryBonus, score);
//console.log("POI lvl" + lvl + "gives " + score + "points, next lvl at " + scoreNext + " points. Resource bonus: " + resBonus + " Unit bonus: " + unitBonus + "%");
/*
 ClientLib.Data.Player
 get_ResearchPoints
 GetCreditsCount
 GetCreditsGrowth
ClientLib.Data.PlayerResearch get_PlayerResearch ()
ClientLib.Data.PlayerResearchItem GetResearchItemFomMdbId (System.Int32 _mdbId)
ClientLib.Data.PlayerResearchItem.System.Object get_NextLevelInfo_Obj ()

var cw=ClientLib.Data.MainData.GetInstance().get_Player().get_Faction();
var cj=ClientLib.Base.Tech.GetTechIdFromTechNameAndFaction(ClientLib.Base.ETechName.Research_BaseFound,cw);
var cd=cr.GetResearchItemFomMdbId(cj);
 */
(function ()
{
    var MaelstromTools_main = function ()
    {
        try
        {
            function CCTAWrapperIsInstalled()
            {
                return (typeof (CCTAWrapper_IsInstalled) != 'undefined' && CCTAWrapper_IsInstalled);
            }

            function createMaelstromTools()
            {
                console.log('MaelstromTools loaded');

                qx.Class.define("MaelstromTools.Language", {
                    type: "singleton",
                    extend: qx.core.Object,
                    construct: function (language)
                    {
                        this.Languages = ['de', 'pt', 'fr', 'tr']; // en is default, not needed in here!
                        if (language != null)
                        {
                            this.MyLanguage = language;
                        }
                    },
                    members: {
                        MyLanguage: "en",
                        Languages: null,
                        Data: null,

                        loadData: function (language)
                        {
                            var l = this.Languages.indexOf(language);

                            if (l < 0)
                            {
                                this.Data = null;
                                return;
                            }

                            this.Data = new Object();
                            this.Data["Collect all packages"] = ["Alle Pakete einsammeln", "Recolher todos os pacotes", "R�cup�rez tous les paquets", "T�m paketleri topla"][l];
                            this.Data["Overall production"] = ["Produktions�bersicht", "Produ��o global", "La production globale", "Genel �retim"][l];
                            this.Data["Army overview"] = ["Truppen�bersicht", "Vista Geral de Ex�rcito", "Arm�e aper�u", "Ordu �nizlemesi"][l];
                            this.Data["Base resources"] = ["Basis Ressourcen", "Recursos base", "ressources de base", "�s �nizlemesi"][l];
                            this.Data["Main menu"] = ["Hauptmen�", "Menu Principal", "menu principal", "Ana men�"][l];
                            this.Data["Repair all units"] = ["Alle Einheiten reparieren", "Reparar todas as unidades", "R�parer toutes les unit�s", "T�m �niteleri onar"][l];
                            this.Data["Repair all defense buildings"] = ["Alle Verteidigungsgeb�ude reparieren", "Reparar todos os edif�cios de defesa", "R�parer tous les b�timents de d�fense", "T�m savunma binalarini onar"][l];
                            this.Data["Repair all buildings"] = ["Alle Geb�urde reparieren", "Reparar todos os edif�cios", "R�parer tous les b�timents", "T�m binalari onar"][l];
                            this.Data["Base status overview"] = ["Basis�bersicht", "Estado geral da base", "aper�u de l'�tat de base", "�s durumu �nizlemesi"][l];
                            this.Data["Upgrade priority overview"] = ["Upgrade �bersicht", "Prioridade de upgrades", "aper�u des priorit�s de mise � niveau", "Y�kseltme �nceligi �nizlemesi"][l];
                            this.Data["MaelstromTools Preferences"] = ["MaelstromTools Einstellungen", "Prefer�ncias de MaelstromTools", "Pr�f�rences MaelstromTools", "MaelstromTools Ayarlari"][l];
                            this.Data["Options"] = ["Einstellungen", "Op��es", "Options", "Se�enekler"][l];
                            this.Data["Target out of range, no resource calculation possible"] = ["Ziel nicht in Reichweite, kann die pl�nderbaren Ressourcen nicht berechnen", "Alvo fora do alcance, n�o � possivel calcular os recursos", "Cible hors de port�e, pas de calcul de ressources possible",
                            "Hedef menzil disinda, kaynak hesaplamasi olanaksiz"][l];
                            this.Data["Lootable resources"] = ["Pl�nderbare Ressourcen", "Recursos roub�veis", "Ressources � piller", "Yagmalanabilir kaynaklar"][l];
                            this.Data["per CP"] = ["pro KP", "por PC", "par PC", "KP basina"][l];
                            this.Data["2nd run"] = ["2. Angriff", "2� ataque", "2� attaque", "2. saldiri"][l];
                            this.Data["3rd run"] = ["3. Angriff", "3� ataque", "3� attaque", "3. saldiri"][l];
                            this.Data["Calculating resources..."] = ["Berechne pl�nderbare Ressourcen...", "A calcular recursos...", "calcul de ressources ...", "Kaynaklar hesaplaniyor..."][l];
                            this.Data["Next MCV"] = ["MBF", "MCV", "VCM"][l];
                            this.Data["Show time to next MCV"] = ["Zeige Zeit bis zum n�chsten MBF", "Mostrar tempo restante at� ao pr�ximo MCV", "Afficher l'heure pour le prochain VCM ", "Sirdaki MCV i�in gereken s�reyi g�ster"][l];
                            this.Data["Show lootable resources (restart required)"] = ["Zeige pl�nderbare Ressourcen (Neustart n�tig)", "Mostrar recursos roub�veis (� necess�rio reiniciar)", "Afficher les ressources fouiller (red�marrage n�cessaire)", "Yagmalanabilir kaynaklari g�ster (yeniden baslatma gerekli)"][l];
                            this.Data["Use dedicated Main Menu (restart required)"] = ["Verwende extra Hauptmen� (Neustart n�tig)", "Usar bot�o para o Menu Principal (� necess�rio reiniciar)", "Utiliser d�di�e du menu principal (red�marrage n�cessaire)", "Ana men� tusunu kullan (yeniden baslatma gerekli)"][l];
                            this.Data["Autocollect packages"] = ["Sammle Pakete automatisch", "Auto recolher pacotes", "paquets autocollect�", "Paketleri otomatik topla"][l];
                            this.Data["Autorepair units"] = ["Repariere Einheiten automatisch", "Auto reparar o ex�rcito", "unit�s autor�par�", "�niteleri otomatik onar"][l];
                            this.Data["Autorepair defense (higher prio than buildings)"] = ["Repariere Verteidigung automatisch (h�here Prio als Geb�ude)", "Auto reparar defesa (maior prioridade do que os edif�cios)", "r�paration automatique la d�fense (priorit� plus �lev� que les b�timents) ", "Savunmayi otomatik onar (binalardan daha y�ksek �ncelikli olarak)"][l];
                            this.Data["Autorepair buildings"] = ["Repariere Geb�ude automatisch", "Auto reparar edif�cios", "b�timents autor�par�", "Binalari otomatik onar"][l];
                            this.Data["Automatic interval in minutes"] = ["Auto-Intervall in Minuten", "Intervalo de tempo autom�tico (em minutos)", "intervalle automatique en quelques minutes", "Otomatik toplama araligi (dk)"][l];
                            this.Data["Apply changes"] = ["Speichern", "Confirmar", "Appliquer changements", "Uygula"][l];
                            this.Data["Discard changes"] = ["Abbrechen", "Cancelar", "Annuler changements", "Iptal"][l];
                            this.Data["Reset to default"] = ["Auf Standard zur�cksetzen", "Defini��es padr�o", "R�initialiser", "Sifirla"][l];
                            this.Data["Continuous"] = ["Kontinuierlich", "Cont�nua", "continue", "S�rekli"][l];
                            this.Data["Bonus"] = ["Pakete", "B�nus", "Bonus", "Bonus"][l];
                            this.Data["POI"] = ["POI", "POI", "POI", "POI"][l];
                            this.Data["Total / h"] = ["Gesamt / h", "Total / h", "Total / h", "Toplam / sa."][l];
                            this.Data["Repaircharges"] = ["Reparaturzeiten", "Custo de repara��o", "frais de r�paration", "Onarim maliyeti"][l];
                            this.Data["Repairtime"] = ["Max. verf�gbar", "Tempo de repara��o", "Temps de r�paration", "Onarim s�resi"][l];
                            this.Data["Attacks"] = ["Angriffe", "Ataques", "Attaques", "Saldirilar"][l];
                            this.Data[MaelstromTools.Statics.Infantry] = ["Infanterie", "Infantaria", "Infanterie", "Piyade"][l];
                            this.Data[MaelstromTools.Statics.Vehicle] = ["Fahrzeuge", "Ve�culos", "Vehicule", "Motorlu B."][l];
                            this.Data[MaelstromTools.Statics.Aircraft] = ["Flugzeuge", "Aeronaves", "Aviation", "Hava A."][l];
                            this.Data[MaelstromTools.Statics.Tiberium] = ["Tiberium", "Tib�rio", "Tiberium", "Tiberium"][l];
                            this.Data[MaelstromTools.Statics.Crystal] = ["Kristalle", "Cristal", "Cristal", "Kristal"][l];
                            this.Data[MaelstromTools.Statics.Power] = ["Strom", "Pot�ncia", "Energie", "G��"][l];
                            this.Data[MaelstromTools.Statics.Dollar] = ["Credits", "Cr�ditos", "Cr�dit", "Kredi"][l];
                            this.Data[MaelstromTools.Statics.Research] = ["Forschung", "Investiga��o", "Recherche", "Arastirma"][l];
                            this.Data["Base"] = ["Basis", "Base", "Base", "�s"][l];
                            this.Data["Defense"] = ["Verteidigung", "Defesa", "D�fense", "Savunma"][l];
                            this.Data["Army"] = ["Armee", "Ex�rcito", "Arm�e", "Ordu"][l];
                            this.Data["Level"] = ["Stufe", "N�vel", "Niveau", "Seviye"][l];
                            this.Data["Buildings"] = ["Geb�ude", "Edif�cios", "B�timents", "Binalar"][l];
                            this.Data["Health"] = ["Leben", "Vida", "Sant�", "Saglik"][l];
                            this.Data["Units"] = ["Einheiten", "Unidades", "Unit�s", "�niteler"][l];
                            this.Data["Hide Mission Tracker"] = ["Missionsfenster ausblenden", "Esconder janela das Miss�es", "Cacher la fen�tre de mission", "G�rev Izleyicisini Gizle"][l];
                            this.Data["none"] = ["keine", "nenhum", "aucun", "hi�biri"][l];
                            this.Data["Cooldown"] = ["Cooldown", "Relocaliza��o", "Recharge", "Cooldown"][l];
                            this.Data["Protection"] = ["Gesch�tzt bis", "Protec��o", "Protection", "Koruma"][l];
                            this.Data["Available weapon"] = ["Verf�gbare Artillerie", "Apoio dispon�vel", "arme disponible", "Mevcut silah"][l];
                            this.Data["Calibrated on"] = ["Kalibriert auf", "Calibrado em", "Calibr� sur ", "Kalibreli"][l];
                            this.Data["Total resources"] = ["Gesamt", "Total de recursos", "Ressources totales", "Toplam kaynaklar"][l];
                            this.Data["Max. storage"] = ["Max. Kapazit�t", "Armazenamento M�x.", "Max. de stockage", "Maks. Depo"][l];
                            this.Data["Storage full!"] = ["Lager voll!", "Armazenamento cheio!", "Stockage plein", "Depo dolu!"][l];
                            this.Data["Storage"] = ["Lagerstand", "Armazenamento", "Stockage", "Depo"][l];
                            this.Data["display only top buildings"] = ["Nur Top-Geb�ude anzeigen", "Mostrar apenas melhores edif�cios", "afficher uniquement les b�timents principaux", "yalnizca en iyi binalari g�ster"][l];
                            this.Data["display only affordable buildings"] = ["Nur einsetzbare Geb�ude anzeigen", "Mostrar apenas ed�ficios acess�veis", "afficher uniquement les b�timents abordables", "yalnizca satin alinabilir binalari g�ster"][l];
                            this.Data["City"] = ["Stadt", "Base", "Base", "Sehir"][l];
                            this.Data["Type (coord)"] = ["Typ (Koord.)", "Escrever (coord)", "Type (coord)", "Tip (koord.)"][l];
                            this.Data["to Level"] = ["Auf Stufe", "para n�vel", "� Niveau ", "Seviye i�in"][l];
                            this.Data["Gain/h"] = ["Zuwachs/h", "Melhoria/h", "Gain / h", "Kazan� / sa."][l];
                            this.Data["Factor"] = ["Faktor", "Factor", "Facteur", "Fakt�r"][l];
                            this.Data["Tib/gain"] = ["Tib./Zuwachs", "Tib/melhoria", "Tib / gain", "Tib/Kazan�"][l];
                            this.Data["Pow/gain"] = ["Strom/Zuwachs", "Potencia/melhoria", "Puissance / Gain", "G��/Kazan�"][l];
                            this.Data["ETA"] = ["Verf�gbar in", "Tempo restante", "Temps restant", "Kalan Zaman"][l];
                            this.Data["Upgrade"] = ["Aufr�sten", "Upgrade", "Upgrade", "Y�kselt"][l];
                            this.Data["Powerplant"] = ["Kratfwerk", "Central de Energia", "Centrale", "G�� Santrali"][l];
                            this.Data["Refinery"] = ["Raffinerie", "Refinaria", "Raffinerie", "Rafineri"][l];
                            this.Data["Harvester"] = ["Sammler", "Harvester", "Collecteur", "Bi�erd�ver"][l];
                            this.Data["Silo"] = ["Silo", "Silo", "Silo", "Silo"][l];
                            this.Data["Accumulator"] = ["Akkumulator", "Acumulador", "Accumulateur", "Ak�m�lat�r"][l];
                            this.Data["Calibrate support"] = ["Artillerie kalibrieren", "Calibrar apoio", "Calibrer soutien", "Takviyeyi kalibre et"][l];
                            this.Data["Access"] = ["�ffne", "Aceder", "Acc�s ", "A�"][l];
                            this.Data["Focus on"] = ["Zentriere auf", "Concentrar em", "Centr� sur", "Odaklan"][l];
                            this.Data["Possible attacks from this base (available CP)"] = ["M�gliche Angriffe (verf�gbare KP)", "Possible attacks from this base (available CP)", "Possible attacks from this base (available CP)", "Bu �sten yapilmasi m�mk�n olan saldirilar (mevcut KP)"][l];
                        },
                        get: function (ident)
                        {
                            return this.gt(ident);
                        },
                        gt: function (ident)
                        {
                            if (!this.Data || !this.Data[ident])
                            {
                                return ident;
                            }
                            return this.Data[ident];
                        }
                    }
                }),

                // define Base
                qx.Class.define("MaelstromTools.Base", {
                    type: "singleton",
                    extend: qx.core.Object,
                    members: {
                        /* Desktop */
                        /* MOD PERFORMANCE LONGER WAITS TO INCREASE RESPONSIVENESS AND REDUCE SERVER STRESS
                        timerInterval: 1500,
                        mainTimerInterval: 5000, */
                        timerInterval: 6000,
                        mainTimerInterval: 20000,
                        lootStatusInfoInterval: null,
                        images: null,
                        mWindows: null,
                        mainMenuWindow: null,

                        itemsOnDesktop: null,
                        itemsOnDesktopCount: null,
                        itemsInMainMenu: null,
                        itemsInMainMenuCount: null,
                        buttonCollectAllResources: null,
                        buttonRepairAllUnits: null,
                        buttonRepairAllBuildings: null,

                        lootWidget: null,

                        initialize: function ()
                        {
                            try
                            {
                                Lang.loadData(qx.locale.Manager.getInstance().getLocale());
                                this.itemsOnDesktopCount = new Array();
                                this.itemsOnDesktop = new Object();
                                this.itemsInMainMenuCount = new Array();
                                this.itemsInMainMenu = new Object();

                                var fileManager = ClientLib.File.FileManager.GetInstance();
                                var factionText = ClientLib.Base.Util.GetFactionGuiPatchText();
                                this.createNewImage(MaelstromTools.Statics.Tiberium, "ui/common/icn_res_tiberium.png", fileManager);
                                this.createNewImage(MaelstromTools.Statics.Crystal, "ui/common/icn_res_chrystal.png", fileManager);
                                this.createNewImage(MaelstromTools.Statics.Power, "ui/common/icn_res_power.png", fileManager);
                                this.createNewImage(MaelstromTools.Statics.Dollar, "ui/common/icn_res_dollar.png", fileManager);
                                this.createNewImage(MaelstromTools.Statics.Research, "ui/common/icn_res_research.png", fileManager);
                                this.createNewImage("Sum", "ui/common/icn_build_slots.png", fileManager);
                                this.createNewImage("AccessBase", "ui/" + factionText + "/icons/icon_mainui_enterbase.png", fileManager);
                                this.createNewImage("FocusBase", "ui/" + factionText + "/icons/icon_mainui_focusbase.png", fileManager);
                                this.createNewImage("Packages", "ui/" + factionText + "/icons/icon_collect_packages.png", fileManager);
                                this.createNewImage("RepairAllUnits", "ui/" + factionText + "/icons/icon_army_points.png", fileManager);
                                this.createNewImage("RepairAllBuildings", "ui/" + factionText + "/icons/icn_build_slots.png", fileManager);
                                this.createNewImage("ResourceOverviewMenu", "ui/common/icn_res_chrystal.png", fileManager);
                                this.createNewImage("ProductionMenu", "ui/" + factionText + "/icons/icn_build_slots.png", fileManager);
                                this.createNewImage("RepairTimeMenu", "ui/" + factionText + "/icons/icon_repair_all_button.png", fileManager);
                                this.createNewImage("Crosshair", "ui/icons/icon_support_tnk_white.png", fileManager);
                                this.createNewImage("UpgradeBuilding", "ui/" + factionText + "/icons/icon_building_detail_upgrade.png", fileManager);

                                this.createNewWindow("MainMenu", "R", 125, 140, 120, 100, "B");
                                this.createNewWindow("Production", "L", 120, 60, 340, 140);
                                this.createNewWindow("RepairTime", "L", 120, 60, 340, 140);
                                this.createNewWindow("ResourceOverview", "L", 120, 60, 340, 140);
                                this.createNewWindow("BaseStatusOverview", "L", 120, 60, 340, 140);
                                this.createNewWindow("Preferences", "L", 120, 60, 440, 140);
                                this.createNewWindow("UpgradePriority", "L", 120, 60, 870, 400);

                                if (!this.mainMenuWindow)
                                {
                                    this.mainMenuWindow = new qx.ui.popup.Popup(new qx.ui.layout.Canvas()).set({
                                        padding: 5,
                                        paddingRight: 0
                                    });
                                    if (MT_Preferences.Settings.useDedicatedMainMenu)
                                    {
                                        this.mainMenuWindow.setPlaceMethod("mouse");
                                        this.mainMenuWindow.setPosition("top-left");
                                    } else
                                    {
                                        this.mainMenuWindow.setPlaceMethod("widget");
                                        this.mainMenuWindow.setPosition("bottom-right");
                                        this.mainMenuWindow.setAutoHide(false);
                                        this.mainMenuWindow.setBackgroundColor("transparent");
                                        this.mainMenuWindow.setShadow(null);
                                        this.mainMenuWindow.setDecorator(new qx.ui.decoration.Background());
                                    }
                                }

                                var desktopPositionModifier = 0;

                                this.buttonCollectAllResources = this.createDesktopButton(Lang.gt("Collect all packages"), "Packages", true, this.desktopPosition(desktopPositionModifier));
                                this.buttonCollectAllResources.addListener("execute", this.collectAllPackages, this);

                                var openProductionWindowButton = this.createDesktopButton(Lang.gt("Overall production"), "ProductionMenu", false, this.desktopPosition(desktopPositionModifier));
                                openProductionWindowButton.addListener("execute", function ()
                                {
                                    window.MaelstromTools.Production.getInstance().openWindow("Production", Lang.gt("Overall production"));
                                }, this);

                                var openResourceOverviewWindowButton = this.createDesktopButton(Lang.gt("Base resources"), "ResourceOverviewMenu", false, this.desktopPosition(desktopPositionModifier));
                                openResourceOverviewWindowButton.addListener("execute", function ()
                                {
                                    window.MaelstromTools.ResourceOverview.getInstance().openWindow("ResourceOverview", Lang.gt("Base resources"));
                                }, this);

                                desktopPositionModifier++;
                                var openMainMenuButton = this.createDesktopButton(Lang.gt("Main menu"), "ProductionMenu", false, this.desktopPosition(desktopPositionModifier));
                                openMainMenuButton.addListener("click", function (e)
                                {
                                    this.mainMenuWindow.placeToMouse(e);
                                    this.mainMenuWindow.show();
                                }, this);

                                this.buttonRepairAllUnits = this.createDesktopButton(Lang.gt("Repair all units"), "RepairAllUnits", true, this.desktopPosition(desktopPositionModifier));
                                this.buttonRepairAllUnits.addListener("execute", this.repairAllUnits, this);

                                this.buttonRepairAllBuildings = this.createDesktopButton(Lang.gt("Repair all buildings"), "RepairAllBuildings", true, this.desktopPosition(desktopPositionModifier));
                                this.buttonRepairAllBuildings.addListener("execute", this.repairAllBuildings, this);

                                var openRepairTimeWindowButton = this.createDesktopButton(Lang.gt("Army overview"), "RepairTimeMenu", false, this.desktopPosition(desktopPositionModifier));
                                openRepairTimeWindowButton.addListener("execute", function ()
                                {
                                    window.MaelstromTools.RepairTime.getInstance().openWindow("RepairTime", Lang.gt("Army overview"));
                                }, this);

                                var openBaseStatusOverview = this.createDesktopButton(Lang.gt("Base status overview"), "Crosshair", false, this.desktopPosition(desktopPositionModifier));
                                openBaseStatusOverview.addListener("execute", function ()
                                {
                                    window.MaelstromTools.BaseStatus.getInstance().openWindow("BaseStatusOverview", Lang.gt("Base status overview"));
                                }, this);

                                desktopPositionModifier++;
                                var openHuffyUpgradeOverview = this.createDesktopButton(Lang.gt("Upgrade priority overview"), "UpgradeBuilding", false, this.desktopPosition(desktopPositionModifier));
                                openHuffyUpgradeOverview.addListener("execute", function ()
                                {
                                    window.HuffyTools.UpgradePriorityGUI.getInstance().openWindow("UpgradePriority", Lang.gt("Upgrade priority overview"));
                                }, this);

                                desktopPositionModifier++;
                                var preferencesButton = new qx.ui.form.Button(Lang.gt("Options")).set({
                                    appearance: "button-text-small",
                                    width: 100,
                                    minWidth: 100,
                                    maxWidth: 100
                                });
                                preferencesButton.setUserData("desktopPosition", this.desktopPosition(desktopPositionModifier));
                                preferencesButton.addListener("execute", function ()
                                {
                                    window.MaelstromTools.Preferences.getInstance().openWindow("Preferences", Lang.gt("MaelstromTools Preferences"), true);
                                }, this);

                                if (MT_Preferences.Settings.useDedicatedMainMenu)
                                {
                                    this.addToDesktop("MainMenu", openMainMenuButton);
                                }
                                this.addToMainMenu("ResourceOverviewMenu", openResourceOverviewWindowButton);
                                this.addToMainMenu("ProductionMenu", openProductionWindowButton);
                                this.addToMainMenu("BaseStatusMenu", openBaseStatusOverview);
                                this.addToMainMenu("RepairTimeMenu", openRepairTimeWindowButton);
                                this.addToMainMenu("UpgradeBuilding", openHuffyUpgradeOverview);

                                this.addToMainMenu("PreferencesMenu", preferencesButton);

                                if (!MT_Preferences.Settings.useDedicatedMainMenu)
                                {
                                    this.mainMenuWindow.show();
                                    var target = qx.core.Init.getApplication().getOptionsBar();
                                    this.mainMenuWindow.placeToWidget(target, true);
                                }

                                webfrontend.gui.chat.ChatWidget.recvbufsize = MaelstromTools.LocalStorage.get(MaelstromTools.Preferences.CHATHISTORYLENGTH, 64);
                                this.runSecondlyTimer();
                                this.runMainTimer();
                                this.runAutoCollectTimer();
                            } catch (e)
                            {
                                console.log("MaelstromTools.initialize: ", e);
                            }
                        },

                        desktopPosition: function (modifier)
                        {
                            if (!modifier) modifier = 0;
                            return modifier;
                        },

                        createDesktopButton: function (title, imageName, isNotification, desktopPosition)
                        {
                            try
                            {
                                if (!isNotification)
                                {
                                    isNotification = false;
                                }
                                if (!desktopPosition)
                                {
                                    desktopPosition = this.desktopPosition();
                                }
                                var desktopButton = new qx.ui.form.Button(null, this.images[imageName]).set({
                                    toolTipText: title,
                                    width: 50,
                                    height: 40,
                                    maxWidth: 50,
                                    maxHeight: 40,
                                    appearance: (isNotification ? "button-standard-nod" : "button-playarea-mode-frame"), //"button-standard-"+factionText), button-playarea-mode-red-frame
                                    center: true
                                });

                                desktopButton.setUserData("isNotification", isNotification);
                                desktopButton.setUserData("desktopPosition", desktopPosition);
                                return desktopButton;
                            } catch (e)
                            {
                                console.log("MaelstromTools.createDesktopButton: ", e);
                            }
                        },

                        createNewImage: function (name, path, fileManager)
                        {
                            try
                            {
                                if (!this.images)
                                {
                                    this.images = new Object();
                                }
                                if (!fileManager)
                                {
                                    return;
                                }

                                this.images[name] = fileManager.GetPhysicalPath(path);
                            } catch (e)
                            {
                                console.log("MaelstromTools.createNewImage: ", e);
                            }
                        },

                        createNewWindow: function (name, align, x, y, w, h, alignV)
                        {
                            try
                            {
                                if (!this.mWindows)
                                {
                                    this.mWindows = new Object();
                                }
                                this.mWindows[name] = new Object();
                                this.mWindows[name]["Align"] = align;
                                this.mWindows[name]["AlignV"] = alignV;
                                this.mWindows[name]["x"] = x;
                                this.mWindows[name]["y"] = y;
                                this.mWindows[name]["w"] = w;
                                this.mWindows[name]["h"] = h;
                            } catch (e)
                            {
                                console.log("MaelstromTools.createNewWindow: ", e);
                            }
                        },

                        addToMainMenu: function (name, button)
                        {
                            try
                            {
                                if (this.itemsInMainMenu[name] != null)
                                {
                                    return;
                                }
                                var desktopPosition = button.getUserData("desktopPosition");
                                var isNotification = button.getUserData("isNotification");
                                if (!desktopPosition)
                                {
                                    desktopPosition = this.desktopPosition();
                                }
                                if (!isNotification)
                                {
                                    isNotification = false;
                                }

                                if (isNotification && MT_Preferences.Settings.useDedicatedMainMenu)
                                {
                                    this.addToDesktop(name, button);
                                } else
                                {
                                    if (!this.itemsInMainMenuCount[desktopPosition])
                                    {
                                        this.itemsInMainMenuCount[desktopPosition] = 0;
                                    }
                                    this.mainMenuWindow.add(button, {
                                        right: 5 + (52 * this.itemsInMainMenuCount[desktopPosition]),
                                        top: 0 + (42 * (desktopPosition)) //bottom: 0 - (42 * (desktopPosition - 1))
                                    });

                                    this.itemsInMainMenu[name] = button;
                                    this.itemsInMainMenuCount[desktopPosition]++;
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.addToMainMenu: ", e);
                            }
                        },

                        removeFromMainMenu: function (name, rearrange)
                        {
                            try
                            {
                                if (rearrange == null)
                                {
                                    rearrange = true;
                                }
                                if (this.itemsOnDesktop[name] != null)
                                {
                                    var isNotification = this.itemsOnDesktop[name].getUserData("isNotification");
                                    if (!isNotification)
                                    {
                                        isNotification = false;
                                    }
                                    if (isNotification && MT_Preferences.Settings.useDedicatedMainMenu)
                                    {
                                        this.removeFromDesktop(name, rearrange);
                                    }
                                } else if (this.itemsInMainMenu[name] != null)
                                {
                                    var desktopPosition = this.itemsInMainMenu[name].getUserData("desktopPosition");
                                    var isNotification = this.itemsInMainMenu[name].getUserData("isNotification");
                                    if (!desktopPosition)
                                    {
                                        desktopPosition = this.desktopPosition();
                                    }
                                    if (!isNotification)
                                    {
                                        isNotification = false;
                                    }

                                    this.mainMenuWindow.remove(this.itemsInMainMenu[name]);
                                    this.itemsInMainMenu[name] = null;
                                    this.itemsInMainMenuCount[desktopPosition]--;

                                    if (rearrange && this.itemsInMainMenu[desktopPosition] > 1)
                                    {
                                        var tmpItems = new Object();

                                        // remove notifications 
                                        for (var itemName in this.itemsOnDesktop)
                                        {
                                            if (this.itemsInMainMenu[itemName] == null)
                                            {
                                                continue;
                                            }
                                            if (!isNotification)
                                            {
                                                continue;
                                            }
                                            tmpItems[itemName] = this.itemsInMainMenu[itemName];
                                            this.removeFromMainMenu(itemName, false);
                                        }

                                        // rearrange notifications
                                        for (var itemName2 in tmpItems)
                                        {
                                            var tmp = tmpItems[itemName2];
                                            if (tmp == null)
                                            {
                                                continue;
                                            }
                                            this.addToMainMenu(itemName2, tmp);
                                        }
                                    }
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.removeFromDesktop: ", e);
                            }
                        },

                        addToDesktop: function (name, button)
                        {
                            try
                            {
                                if (this.itemsOnDesktop[name] != null)
                                {
                                    return;
                                }
                                var desktopPosition = button.getUserData("desktopPosition");
                                if (!desktopPosition)
                                {
                                    desktopPosition = this.desktopPosition();
                                }

                                if (!this.itemsOnDesktopCount[desktopPosition])
                                {
                                    this.itemsOnDesktopCount[desktopPosition] = 0;
                                }

                                var app = qx.core.Init.getApplication();
                                app.getDesktop().add(button, {
                                    right: 120 + (52 * this.itemsOnDesktopCount[desktopPosition]),
                                    bottom: 154 - (42 * (desktopPosition - 1))
                                });

                                this.itemsOnDesktop[name] = button;
                                this.itemsOnDesktopCount[desktopPosition]++;
                            } catch (e)
                            {
                                console.log("MaelstromTools.addToDesktop: ", e);
                            }
                        },

                        removeFromDesktop: function (name, rearrange)
                        {
                            try
                            {
                                if (rearrange == null)
                                {
                                    rearrange = true;
                                }
                                var app = qx.core.Init.getApplication();

                                if (this.itemsOnDesktop[name] != null)
                                {
                                    var desktopPosition = this.itemsOnDesktop[name].getUserData("desktopPosition");
                                    var isNotification = this.itemsOnDesktop[name].getUserData("isNotification");
                                    if (!desktopPosition)
                                    {
                                        desktopPosition = this.desktopPosition();
                                    }
                                    if (!isNotification)
                                    {
                                        isNotification = false;
                                    }

                                    app.getDesktop().remove(this.itemsOnDesktop[name]);
                                    this.itemsOnDesktop[name] = null;
                                    this.itemsOnDesktopCount[desktopPosition]--;

                                    if (rearrange && this.itemsOnDesktopCount[desktopPosition] > 1)
                                    {
                                        var tmpItems = new Object();

                                        // remove notifications 
                                        for (var itemName in this.itemsOnDesktop)
                                        {
                                            if (this.itemsOnDesktop[itemName] == null)
                                            {
                                                continue;
                                            }
                                            if (!this.itemsOnDesktop[itemName].getUserData("isNotification"))
                                            {
                                                continue;
                                            }
                                            tmpItems[itemName] = this.itemsOnDesktop[itemName];
                                            this.removeFromDesktop(itemName, false);
                                        }

                                        // rearrange notifications
                                        for (var itemName2 in tmpItems)
                                        {
                                            var tmp = tmpItems[itemName2];
                                            if (tmp == null)
                                            {
                                                continue;
                                            }
                                            this.addToMainMenu(itemName2, tmp);
                                        }
                                    }
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.removeFromDesktop: ", e);
                            }
                        },

                        runSecondlyTimer: function ()
                        {
                            try
                            {
                                this.calculateCostsForNextMCV();

                                var self = this;
                                window.setTimeout(function ()
                                {
                                    self.runSecondlyTimer();
                                }, 1000);
                            } catch (e)
                            {
                                console.log("MaelstromTools.runSecondlyTimer: ", e);
                            }
                        },

                        runMainTimer: function ()
                        {
                            try
                            {
                                this.checkForPackages();
                                if (CCTAWrapperIsInstalled())
                                {
                                    this.checkRepairAllUnits();
                                    this.checkRepairAllBuildings();
                                }

                                var missionTracker = typeof (qx.core.Init.getApplication().getMissionsBar) === 'function' ? qx.core.Init.getApplication().getMissionsBar() : qx.core.Init.getApplication().getMissionTracker(); //fix for PerforceChangelist>=376877
                                if (MT_Preferences.Settings.autoHideMissionTracker)
                                {
                                    if (missionTracker.isVisible())
                                    {
                                        missionTracker.hide();
                                    }
                                    if (typeof (qx.core.Init.getApplication().getMissionsBar) === 'function')
                                    {
                                        if (qx.core.Init.getApplication().getMissionsBar().getSizeHint().height != 0)
                                        {
                                            qx.core.Init.getApplication().getMissionsBar().getSizeHint().height = 0;
                                            qx.core.Init.getApplication().triggerDesktopResize();
                                        }
                                    }
                                } else
                                {
                                    if (!missionTracker.isVisible())
                                    {
                                        missionTracker.show();
                                        if (typeof (qx.core.Init.getApplication().getMissionsBar) === 'function')
                                        {
                                            qx.core.Init.getApplication().getMissionsBar().initHeight();
                                            qx.core.Init.getApplication().triggerDesktopResize();
                                        }
                                    }
                                }

                                var self = this;
                                window.setTimeout(function ()
                                {
                                    self.runMainTimer();
                                }, this.mainTimerInterval);
                            } catch (e)
                            {
                                console.log("MaelstromTools.runMainTimer: ", e);
                            }
                        },

                        runAutoCollectTimer: function ()
                        {
                            try
                            {
                                if (!CCTAWrapperIsInstalled()) return; // run timer only then wrapper is running
                                if (this.checkForPackages() && MT_Preferences.Settings.autoCollectPackages)
                                {
                                    this.collectAllPackages();
                                }
                                if (this.checkRepairAllUnits() && MT_Preferences.Settings.autoRepairUnits)
                                {
                                    this.repairAllUnits();
                                }
                                if (this.checkRepairAllBuildings() && MT_Preferences.Settings.autoRepairBuildings)
                                {
                                    this.repairAllBuildings();
                                }

                                var self = this;
                                window.setTimeout(function ()
                                {
                                    self.runAutoCollectTimer();
                                }, MT_Preferences.Settings.AutoCollectTimer * 60000);
                            } catch (e)
                            {
                                console.log("MaelstromTools.runMainTimer: ", e);
                            }
                        },

                        openWindow: function (windowObj, windowName, skipMoveWindow)
                        {
                            try
                            {
                                if (!windowObj.isVisible())
                                {
                                    if (windowName == "MainMenu")
                                    {
                                        windowObj.show();
                                    } else
                                    {
                                        if (!skipMoveWindow)
                                        {
                                            this.moveWindow(windowObj, windowName);
                                        }
                                        windowObj.open();
                                    }
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.openWindow: ", e);
                            }
                        },

                        moveWindow: function (windowObj, windowName)
                        {
                            try
                            {
                                var x = this.mWindows[windowName]["x"];
                                var y = this.mWindows[windowName]["y"];
                                if (this.mWindows[windowName]["Align"] == "R")
                                {
                                    x = qx.bom.Viewport.getWidth(window) - this.mWindows[windowName]["x"];
                                }
                                if (this.mWindows[windowName]["AlignV"] == "B")
                                {
                                    y = qx.bom.Viewport.getHeight(window) - this.mWindows[windowName]["y"] - windowObj.height;
                                }
                                windowObj.moveTo(x, y);
                                if (windowName != "MainMenu")
                                {
                                    windowObj.setHeight(this.mWindows[windowName]["h"]);
                                    windowObj.setWidth(this.mWindows[windowName]["w"]);
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.moveWindow: ", e);
                            }
                        },

                        checkForPackages: function ()
                        {
                            try
                            {
                                MT_Cache.updateCityCache();

                                for (var cname in MT_Cache.Cities)
                                {
                                    var ncity = MT_Cache.Cities[cname].Object;
                                    if (ncity.get_CityBuildingsData().get_HasCollectableBuildings())
                                    {
                                        this.addToMainMenu("CollectAllResources", this.buttonCollectAllResources);
                                        return true;
                                    }
                                }
                                this.removeFromMainMenu("CollectAllResources");
                                return false;
                            } catch (e)
                            {
                                console.log("MaelstromTools.checkForPackages: ", e);
                                return false;
                            }
                        },

                        collectAllPackages: function ()
                        {
                            try
                            {
                                MT_Cache.updateCityCache();
                                for (var cname in MT_Cache.Cities)
                                {
                                    var ncity = MT_Cache.Cities[cname].Object;
                                    if (ncity.get_CityBuildingsData().get_HasCollectableBuildings())
                                    {
                                        if (MT_Cache.CityCount <= 1)
                                        {
                                            var buildings = ncity.get_Buildings().d;
                                            for (var x in buildings)
                                            {
                                                var building = buildings[x];
                                                if (building.get_ProducesPackages() && building.get_ReadyToCollect())
                                                {
                                                    ClientLib.Net.CommunicationManager.GetInstance().SendCommand("CollectResource", { cityid: ncity.get_Id(), posX: building.get_CoordX(), posY: building.get_CoordY() }, null, null, true);
                                                }
                                            }
                                        } else
                                        {
                                            ncity.CollectAllResources();
                                        }
                                    }
                                }
                                this.removeFromMainMenu("CollectAllResources");
                            } catch (e)
                            {
                                console.log("MaelstromTools.collectAllPackages: ", e);
                            }
                        },

                        checkRepairAll: function (visMode, buttonName, button)
                        {
                            try
                            {
                                MT_Cache.updateCityCache();

                                for (var cname in MT_Cache.Cities)
                                {
                                    var ncity = MT_Cache.Cities[cname].Object;
                                    if (MaelstromTools.Wrapper.CanRepairAll(ncity, visMode))
                                    {
                                        this.addToMainMenu(buttonName, button);
                                        return true;
                                    }
                                }

                                this.removeFromMainMenu(buttonName);
                                return false;
                            } catch (e)
                            {
                                console.log("MaelstromTools.checkRepairAll: ", e);
                                return false;
                            }
                        },

                        checkRepairAllUnits: function ()
                        {
                            return this.checkRepairAll(ClientLib.Vis.Mode.ArmySetup, "RepairAllUnits", this.buttonRepairAllUnits);
                        },

                        checkRepairAllBuildings: function ()
                        {
                            return this.checkRepairAll(ClientLib.Vis.Mode.City, "RepairAllBuildings", this.buttonRepairAllBuildings);
                        },

                        repairAll: function (visMode, buttonName)
                        {
                            try
                            {
                                MT_Cache.updateCityCache();

                                for (var cname in MT_Cache.Cities)
                                {
                                    var ncity = MT_Cache.Cities[cname].Object;
                                    if (MaelstromTools.Wrapper.CanRepairAll(ncity, visMode))
                                    {
                                        MaelstromTools.Wrapper.RepairAll(ncity, visMode);
                                    }

                                }
                                this.removeFromMainMenu(buttonName);
                            } catch (e)
                            {
                                console.log("MaelstromTools.repairAll: ", e);
                            }
                        },
                        repairAllUnits: function ()
                        {
                            try
                            {
                                this.repairAll(ClientLib.Vis.Mode.ArmySetup, "RepairAllUnits");
                            } catch (e)
                            {
                                console.log("MaelstromTools.repairAllUnits: ", e);
                            }
                        },

                        repairAllBuildings: function ()
                        {
                            try
                            {
                                this.repairAll(ClientLib.Vis.Mode.City, "RepairAllBuildings");
                            } catch (e)
                            {
                                console.log("MaelstromTools.repairAllBuildings: ", e);
                            }
                        },

                        updateLoot: function (ident, visCity, widget)
                        {
                            try
                            {
                                clearInterval(this.lootStatusInfoInterval);
                                if (!MT_Preferences.Settings.showLoot)
                                {
                                    if (this.lootWidget[ident])
                                    {
                                        this.lootWidget[ident].removeAll();
                                    }
                                    return;
                                }

                                var baseLoadState = MT_Cache.updateLoot(visCity);
                                if (baseLoadState == -2)
                                {
                                    // base already cached and base not changed
                                    return;
                                }

                                if (!this.lootWidget)
                                {
                                    this.lootWidget = new Object();
                                }
                                if (!this.lootWidget[ident])
                                {
                                    this.lootWidget[ident] = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 5));
                                    this.lootWidget[ident].setTextColor("white");
                                    widget.add(this.lootWidget[ident]);
                                }
                                var lootWidget = this.lootWidget[ident];

                                var rowIdx = 1;
                                var colIdx = 1;
                                lootWidget.removeAll();
                                switch (baseLoadState)
                                {
                                    case -1:
                                        {
                                            MaelstromTools.Util.addLabel(lootWidget, rowIdx, colIdx++, "Target out of range, no resource calculation possible", null, null, 'bold', null);
                                            break;
                                        }
                                    case 1:
                                        {
                                            var Resources = MT_Cache.SelectedBaseResources;
                                            this.createResourceLabels(lootWidget, ++rowIdx, "Possible attacks from this base (available CP)", Resources, -1);
                                            this.createResourceLabels(lootWidget, ++rowIdx, "Lootable resources", Resources, 1);
                                            this.createResourceLabels(lootWidget, ++rowIdx, "per CP", Resources, 1 * Resources.CPNeeded);
                                            this.createResourceLabels(lootWidget, ++rowIdx, "2nd run", Resources, 2 * Resources.CPNeeded);
                                            this.createResourceLabels(lootWidget, ++rowIdx, "3rd run", Resources, 3 * Resources.CPNeeded);
                                            break;
                                        }
                                    default:
                                        {
                                            MaelstromTools.Util.addLabel(lootWidget, rowIdx, colIdx++, "Calculating resources...", null, null, 'bold', null);
                                            this.lootStatusInfoInterval = setInterval(function ()
                                            {
                                                MaelstromTools.Base.getInstance().updateLoot(ident, visCity, widget);
                                            }, 100);
                                            break;
                                        }
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.updateLoot: ", e);
                            }
                        },

                        createResourceLabels: function (lootWidget, rowIdx, Label, Resources, Modifier)
                        {
                            var colIdx = 1;
                            var font = (Modifier > 1 ? null : 'bold');

                            if (Modifier == -1 && Resources.CPNeeded > 0)
                            {
                                Label = Lang.gt(Label) + ": " + Math.floor(ClientLib.Data.MainData.GetInstance().get_Player().GetCommandPointCount() / Resources.CPNeeded);
                                MaelstromTools.Util.addLabel(lootWidget, rowIdx, colIdx++, Label, null, 'left', font, null, 9);
                                return;
                            }
                            colIdx = 1;
                            if (Modifier > 0)
                            {
                                MaelstromTools.Util.addLabel(lootWidget, rowIdx, colIdx++, Lang.gt(Label) + ":", null, null, font);
                                MaelstromTools.Util.addImage(lootWidget, rowIdx, colIdx++, MaelstromTools.Util.getImage(MaelstromTools.Statics.Research));
                                MaelstromTools.Util.addLabel(lootWidget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatNumbersCompact(Resources[MaelstromTools.Statics.Research] / Modifier), 50, 'right', font);
                                MaelstromTools.Util.addImage(lootWidget, rowIdx, colIdx++, MaelstromTools.Util.getImage(MaelstromTools.Statics.Tiberium));
                                MaelstromTools.Util.addLabel(lootWidget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatNumbersCompact(Resources[MaelstromTools.Statics.Tiberium] / Modifier), 50, 'right', font);
                                MaelstromTools.Util.addImage(lootWidget, rowIdx, colIdx++, MaelstromTools.Util.getImage(MaelstromTools.Statics.Crystal));
                                MaelstromTools.Util.addLabel(lootWidget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatNumbersCompact(Resources[MaelstromTools.Statics.Crystal] / Modifier), 50, 'right', font);
                                MaelstromTools.Util.addImage(lootWidget, rowIdx, colIdx++, MaelstromTools.Util.getImage(MaelstromTools.Statics.Dollar));
                                MaelstromTools.Util.addLabel(lootWidget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatNumbersCompact(Resources[MaelstromTools.Statics.Dollar] / Modifier), 50, 'right', font);
                                MaelstromTools.Util.addImage(lootWidget, rowIdx, colIdx++, MaelstromTools.Util.getImage("Sum"));
                                MaelstromTools.Util.addLabel(lootWidget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatNumbersCompact(Resources["Total"] / Modifier), 50, 'right', font);
                            }
                        },

                        mcvPopup: null,
                        mcvPopupX: 0,
                        mcvPopupY: 0,
                        mcvTimerLabel: null,
                        calculateCostsForNextMCV: function ()
                        {
                            try
                            {
                                if (!MT_Preferences.Settings.showCostsForNextMCV)
                                {
                                    if (this.mcvPopup)
                                    {
                                        this.mcvPopup.close();
                                    }
                                    return;
                                }
                                var player = ClientLib.Data.MainData.GetInstance().get_Player();
                                var cw = player.get_Faction();
                                var cj = ClientLib.Base.Tech.GetTechIdFromTechNameAndFaction(ClientLib.Base.ETechName.Research_BaseFound, cw);
                                var cr = player.get_PlayerResearch();
                                var cd = cr.GetResearchItemFomMdbId(cj);
                                if (cd == null)
                                {
                                    if (this.mcvPopup)
                                    {
                                        this.mcvPopup.close();
                                    }
                                    return;
                                }

                                if (!this.mcvPopup)
                                {
                                    this.mcvPopup = new qx.ui.window.Window("").set({
                                        contentPadding: 0,
                                        showMinimize: false,
                                        showMaximize: false,
                                        showClose: false,
                                        resizable: false
                                    });
                                    this.mcvPopup.setLayout(new qx.ui.layout.VBox());
                                    this.mcvPopup.addListener("move", function (e)
                                    {
                                        var base = MaelstromTools.Base.getInstance();
                                        var size = qx.core.Init.getApplication().getRoot().getBounds();
                                        var value = size.width - e.getData().left;
                                        base.mcvPopupX = value < 0 ? 150 : value;
                                        value = size.height - e.getData().top;
                                        base.mcvPopupY = value < 0 ? 70 : value;
                                        MaelstromTools.LocalStorage.set("mcvPopup", {
                                            x: base.mcvPopupX,
                                            y: base.mcvPopupY
                                        });
                                    });
                                    var font = qx.bom.Font.fromString('bold').set({
                                        size: 20
                                    });

                                    this.mcvTimerLabel = new qx.ui.basic.Label().set({
                                        font: font,
                                        textColor: 'red',
                                        width: 155,
                                        textAlign: 'center',
                                        marginBottom: 5
                                    });
                                    this.mcvPopup.add(this.mcvTimerLabel);
                                    var serverBar = qx.core.Init.getApplication().getServerBar().getBounds();
                                    var pos = MaelstromTools.LocalStorage.get("mcvPopup", {
                                        x: serverBar.width + 150,
                                        y: 70
                                    });
                                    this.mcvPopupX = pos.x;
                                    this.mcvPopupY = pos.y;
                                    this.mcvPopup.open();
                                }
                                var size = qx.core.Init.getApplication().getRoot().getBounds();
                                this.mcvPopup.moveTo(size.width - this.mcvPopupX, size.height - this.mcvPopupY);

                                var nextLevelInfo = cd.get_NextLevelInfo_Obj();
                                var resourcesNeeded = new Array();
                                for (var i in nextLevelInfo.rr)
                                {
                                    if (nextLevelInfo.rr[i].t > 0)
                                    {
                                        resourcesNeeded[nextLevelInfo.rr[i].t] = nextLevelInfo.rr[i].c;
                                    }
                                }

                                var creditsNeeded = resourcesNeeded[ClientLib.Base.EResourceType.Gold];
                                var creditsResourceData = player.get_Credits();
                                var creditGrowthPerHour = (creditsResourceData.Delta + creditsResourceData.ExtraBonusDelta) * ClientLib.Data.MainData.GetInstance().get_Time().get_StepsPerHour();
                                var creditTimeLeftInHours = (creditsNeeded - player.GetCreditsCount()) / creditGrowthPerHour;

                                if (creditGrowthPerHour == 0 || creditTimeLeftInHours <= 0)
                                {
                                    if (this.mcvPopup)
                                    {
                                        this.mcvPopup.close();
                                    }
                                    return;
                                }

                                this.mcvPopup.setCaption(Lang.gt("Next MCV") + " ($ " + MaelstromTools.Wrapper.FormatNumbersCompact(creditsNeeded) + ")");
                                this.mcvTimerLabel.setValue(MaelstromTools.Wrapper.FormatTimespan(creditTimeLeftInHours * 60 * 60));

                                if (!this.mcvPopup.isVisible())
                                {
                                    this.mcvPopup.open();
                                }
                            } catch (e)
                            {
                                console.log("calculateCostsForNextMCV", e);
                            }
                        }
                    }
                });

                // define Preferences
                qx.Class.define("MaelstromTools.Preferences", {
                    type: "singleton",
                    extend: qx.core.Object,

                    statics: {
                        USEDEDICATEDMAINMENU: "useDedicatedMainMenu",
                        AUTOCOLLECTPACKAGES: "autoCollectPackages",
                        AUTOREPAIRUNITS: "autoRepairUnits",
                        AUTOREPAIRBUILDINGS: "autoRepairBuildings",
                        AUTOHIDEMISSIONTRACKER: "autoHideMissionTracker",
                        AUTOCOLLECTTIMER: "AutoCollectTimer",
                        SHOWLOOT: "showLoot",
                        SHOWCOSTSFORNEXTMCV: "showCostsForNextMCV",
                        CHATHISTORYLENGTH: "ChatHistoryLength"
                    },

                    members: {
                        Window: null,
                        Widget: null,
                        Settings: null,
                        FormElements: null,

                        readOptions: function ()
                        {
                            try
                            {
                                if (!this.Settings)
                                {
                                    this.Settings = new Object();
                                }

                                this.Settings[MaelstromTools.Preferences.USEDEDICATEDMAINMENU] = (MaelstromTools.LocalStorage.get(MaelstromTools.Preferences.USEDEDICATEDMAINMENU, 1) == 1);
                                this.Settings[MaelstromTools.Preferences.AUTOCOLLECTPACKAGES] = (MaelstromTools.LocalStorage.get(MaelstromTools.Preferences.AUTOCOLLECTPACKAGES, 0) == 1);
                                this.Settings[MaelstromTools.Preferences.AUTOREPAIRUNITS] = (MaelstromTools.LocalStorage.get(MaelstromTools.Preferences.AUTOREPAIRUNITS, 0) == 1);
                                this.Settings[MaelstromTools.Preferences.AUTOREPAIRBUILDINGS] = (MaelstromTools.LocalStorage.get(MaelstromTools.Preferences.AUTOREPAIRBUILDINGS, 0) == 1);
                                this.Settings[MaelstromTools.Preferences.AUTOHIDEMISSIONTRACKER] = (MaelstromTools.LocalStorage.get(MaelstromTools.Preferences.AUTOHIDEMISSIONTRACKER, 0) == 1);
                                this.Settings[MaelstromTools.Preferences.AUTOCOLLECTTIMER] = MaelstromTools.LocalStorage.get(MaelstromTools.Preferences.AUTOCOLLECTTIMER, 60);
                                this.Settings[MaelstromTools.Preferences.SHOWLOOT] = (MaelstromTools.LocalStorage.get(MaelstromTools.Preferences.SHOWLOOT, 1) == 1);
                                this.Settings[MaelstromTools.Preferences.SHOWCOSTSFORNEXTMCV] = (MaelstromTools.LocalStorage.get(MaelstromTools.Preferences.SHOWCOSTSFORNEXTMCV, 1) == 1);
                                this.Settings[MaelstromTools.Preferences.CHATHISTORYLENGTH] = MaelstromTools.LocalStorage.get(MaelstromTools.Preferences.CHATHISTORYLENGTH, 64);

                                if (!CCTAWrapperIsInstalled())
                                {
                                    this.Settings[MaelstromTools.Preferences.AUTOREPAIRUNITS] = false;
                                    this.Settings[MaelstromTools.Preferences.AUTOREPAIRBUILDINGS] = false;
                                }

                            } catch (e)
                            {
                                console.log("MaelstromTools.Preferences.readOptions: ", e);
                            }
                        },

                        openWindow: function (WindowName, WindowTitle)
                        {
                            try
                            {
                                if (!this.Window)
                                {
                                    this.Window = new webfrontend.gui.OverlayWindow().set({
                                        autoHide: false,
                                        title: WindowTitle,
                                        minHeight: 350
                                    });
                                    this.Window.clientArea.setPadding(10);
                                    this.Window.clientArea.setLayout(new qx.ui.layout.VBox(3));

                                    this.Widget = new qx.ui.container.Composite(new qx.ui.layout.Grid().set({
                                        spacingX: 5,
                                        spacingY: 5
                                    }));

                                    this.Window.clientArea.add(this.Widget);
                                }

                                if (this.Window.isVisible())
                                {
                                    this.Window.close();
                                } else
                                {
                                    MT_Base.openWindow(this.Window, WindowName);
                                    this.setWidgetLabels();
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.Preferences.openWindow: ", e);
                            }
                        },

                        addFormElement: function (name, element)
                        {
                            this.FormElements[name] = element;
                        },

                        setWidgetLabels: function ()
                        {
                            try
                            {
                                this.readOptions();

                                this.FormElements = new Object();
                                this.Widget.removeAll();
                                var rowIdx = 1;
                                var colIdx = 1;

                                var chkAutoHideMissionTracker = new qx.ui.form.CheckBox(Lang.gt("Hide Mission Tracker")).set({
                                    value: this.Settings[MaelstromTools.Preferences.AUTOHIDEMISSIONTRACKER] == 1
                                });
                                var chkUseDedicatedMainMenu = new qx.ui.form.CheckBox(Lang.gt("Use dedicated Main Menu (restart required)")).set({
                                    value: this.Settings[MaelstromTools.Preferences.USEDEDICATEDMAINMENU] == 1
                                });
                                var chkShowLoot = new qx.ui.form.CheckBox(Lang.gt("Show lootable resources (restart required)")).set({
                                    value: this.Settings[MaelstromTools.Preferences.SHOWLOOT] == 1
                                });
                                var chkCostsNextMCV = new qx.ui.form.CheckBox(Lang.gt("Show time to next MCV")).set({
                                    value: this.Settings[MaelstromTools.Preferences.SHOWCOSTSFORNEXTMCV] == 1
                                });
                                MaelstromTools.Util.addElement(this.Widget, rowIdx++, colIdx, chkAutoHideMissionTracker, 2);
                                MaelstromTools.Util.addElement(this.Widget, rowIdx++, colIdx, chkUseDedicatedMainMenu, 2);
                                MaelstromTools.Util.addElement(this.Widget, rowIdx++, colIdx, chkShowLoot, 2);
                                MaelstromTools.Util.addElement(this.Widget, rowIdx++, colIdx, chkCostsNextMCV, 2);

                                var chkAutoCollectPackages = new qx.ui.form.CheckBox(Lang.gt("Autocollect packages")).set({
                                    value: this.Settings[MaelstromTools.Preferences.AUTOCOLLECTPACKAGES] == 1
                                });
                                var chkAutoRepairUnits = new qx.ui.form.CheckBox(Lang.gt("Autorepair units")).set({
                                    value: this.Settings[MaelstromTools.Preferences.AUTOREPAIRUNITS] == 1,
                                    enabled: CCTAWrapperIsInstalled()
                                });
                                var chkAutoRepairBuildings = new qx.ui.form.CheckBox(Lang.gt("Autorepair buildings")).set({
                                    value: this.Settings[MaelstromTools.Preferences.AUTOREPAIRBUILDINGS] == 1,
                                    enabled: CCTAWrapperIsInstalled()
                                });

                                var spinnerChatHistoryLength = new qx.ui.form.Spinner().set({
                                    minimum: 64,
                                    maximum: 512,
                                    value: this.Settings[MaelstromTools.Preferences.CHATHISTORYLENGTH]
                                });

                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx, Lang.gt("Chat history length") + " (" + spinnerChatHistoryLength.getMinimum() + " - " + spinnerChatHistoryLength.getMaximum() + ")");
                                MaelstromTools.Util.addElement(this.Widget, rowIdx++, colIdx + 1, spinnerChatHistoryLength);

                                var spinnerAutoCollectTimer = new qx.ui.form.Spinner().set({
                                    minimum: 5,
                                    maximum: 60 * 6,
                                    value: this.Settings[MaelstromTools.Preferences.AUTOCOLLECTTIMER]
                                });

                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx, Lang.gt("Automatic interval in minutes") + " (" + spinnerAutoCollectTimer.getMinimum() + " - " + spinnerAutoCollectTimer.getMaximum() + ")");
                                MaelstromTools.Util.addElement(this.Widget, rowIdx++, colIdx + 1, spinnerAutoCollectTimer);
                                MaelstromTools.Util.addElement(this.Widget, rowIdx++, colIdx, chkAutoCollectPackages, 2);
                                MaelstromTools.Util.addElement(this.Widget, rowIdx++, colIdx, chkAutoRepairUnits, 2);
                                MaelstromTools.Util.addElement(this.Widget, rowIdx++, colIdx, chkAutoRepairBuildings, 2);

                                var applyButton = new qx.ui.form.Button(Lang.gt("Apply changes")).set({
                                    appearance: "button-detailview-small",
                                    width: 120,
                                    minWidth: 120,
                                    maxWidth: 120
                                });
                                applyButton.addListener("execute", this.applyChanges, this);

                                var cancelButton = new qx.ui.form.Button(Lang.gt("Discard changes")).set({
                                    appearance: "button-detailview-small",
                                    width: 120,
                                    minWidth: 120,
                                    maxWidth: 120
                                });
                                cancelButton.addListener("execute", function ()
                                {
                                    this.Window.close();
                                }, this);

                                var resetButton = new qx.ui.form.Button(Lang.gt("Reset to default")).set({
                                    appearance: "button-detailview-small",
                                    width: 120,
                                    minWidth: 120,
                                    maxWidth: 120
                                });
                                resetButton.addListener("execute", this.resetToDefault, this);

                                MaelstromTools.Util.addElement(this.Widget, rowIdx++, colIdx, resetButton);
                                colIdx = 1;
                                MaelstromTools.Util.addElement(this.Widget, rowIdx, colIdx++, cancelButton);
                                MaelstromTools.Util.addElement(this.Widget, rowIdx++, colIdx, applyButton);

                                this.addFormElement(MaelstromTools.Preferences.AUTOHIDEMISSIONTRACKER, chkAutoHideMissionTracker);
                                this.addFormElement(MaelstromTools.Preferences.USEDEDICATEDMAINMENU, chkUseDedicatedMainMenu);
                                this.addFormElement(MaelstromTools.Preferences.SHOWLOOT, chkShowLoot);
                                this.addFormElement(MaelstromTools.Preferences.SHOWCOSTSFORNEXTMCV, chkCostsNextMCV);
                                this.addFormElement(MaelstromTools.Preferences.AUTOCOLLECTPACKAGES, chkAutoCollectPackages);
                                this.addFormElement(MaelstromTools.Preferences.AUTOREPAIRUNITS, chkAutoRepairUnits);
                                this.addFormElement(MaelstromTools.Preferences.AUTOREPAIRBUILDINGS, chkAutoRepairBuildings);
                                this.addFormElement(MaelstromTools.Preferences.AUTOCOLLECTTIMER, spinnerAutoCollectTimer);
                                this.addFormElement(MaelstromTools.Preferences.CHATHISTORYLENGTH, spinnerChatHistoryLength);
                            } catch (e)
                            {
                                console.log("MaelstromTools.Preferences.setWidgetLabels: ", e);
                            }
                        },

                        applyChanges: function ()
                        {
                            try
                            {
                                var autoRunNeeded = false;
                                for (var idx in this.FormElements)
                                {
                                    var element = this.FormElements[idx];
                                    if (idx == MaelstromTools.Preferences.AUTOCOLLECTTIMER)
                                    {
                                        autoRunNeeded = (MaelstromTools.LocalStorage.get(MaelstromTools.Preferences.AUTOCOLLECTTIMER, 0) != element.getValue());
                                    }
                                    if (idx == MaelstromTools.Preferences.CHATHISTORYLENGTH)
                                    {
                                        webfrontend.gui.chat.ChatWidget.recvbufsize = element.getValue();
                                    }
                                    MaelstromTools.LocalStorage.set(idx, element.getValue());
                                }
                                this.readOptions();
                                if (autoRunNeeded)
                                {
                                    MT_Base.runAutoCollectTimer();
                                }
                                this.Window.close();
                            } catch (e)
                            {
                                console.log("MaelstromTools.Preferences.applyChanges: ", e);
                            }
                        },

                        resetToDefault: function ()
                        {
                            try
                            {
                                MaelstromTools.LocalStorage.clearAll();
                                this.setWidgetLabels();
                            } catch (e)
                            {
                                console.log("MaelstromTools.Preferences.resetToDefault: ", e);
                            }
                        }
                    }
                });

                // define DefaultObject
                qx.Class.define("MaelstromTools.DefaultObject", {
                    type: "abstract",
                    extend: qx.core.Object,
                    members: {
                        Window: null,
                        Widget: null,
                        Cache: {}, //k null
                        IsTimerEnabled: true,

                        calc: function ()
                        {
                            try
                            {
                                if (this.Window.isVisible())
                                {
                                    this.updateCache();
                                    this.setWidgetLabels();
                                    if (this.IsTimerEnabled)
                                    {
                                        var self = this;
                                        window.setTimeout(function ()
                                        {
                                            self.calc();
                                        }, MT_Base.timerInterval);
                                    }
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.DefaultObject.calc: ", e);
                            }
                        },

                        openWindow: function (WindowName, WindowTitle)
                        {
                            try
                            {
                                if (!this.Window)
                                {
                                    this.Window = new qx.ui.window.Window(WindowTitle).set({
                                        resizable: false,
                                        showMaximize: false,
                                        showMinimize: false,
                                        allowMaximize: false,
                                        allowMinimize: false,
                                        showStatusbar: false
                                    });
                                    this.Window.setPadding(10);
                                    this.Window.setLayout(new qx.ui.layout.VBox(3));

                                    this.Widget = new qx.ui.container.Composite(new qx.ui.layout.Grid());
                                    this.Widget.setTextColor("white");

                                    this.Window.add(this.Widget);
                                }

                                if (this.Window.isVisible())
                                {
                                    this.Window.close();
                                } else
                                {
                                    MT_Base.openWindow(this.Window, WindowName);
                                    this.calc();
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.DefaultObject.openWindow: ", e);
                            }
                        }
                    }
                });

                // define Production
                qx.Class.define("MaelstromTools.Production", {
                    type: "singleton",
                    extend: MaelstromTools.DefaultObject,
                    members: {
                        updateCache: function (onlyForCity)
                        {
                            try
                            {
                                MT_Cache.updateCityCache();
                                var alliance = ClientLib.Data.MainData.GetInstance().get_Alliance();

                                for (var cname in MT_Cache.Cities)
                                {
                                    if (onlyForCity != null && onlyForCity != cname)
                                    {
                                        continue;
                                    }
                                    var ncity = MT_Cache.Cities[cname].Object;
                                    if (typeof (this.Cache[cname]) !== 'object') this.Cache[cname] = {};
                                    if (typeof (this.Cache[cname][MaelstromTools.Statics.Tiberium]) !== 'object') this.Cache[cname][MaelstromTools.Statics.Tiberium] = {}; // all have to be checked, 
                                    if (typeof (this.Cache[cname][MaelstromTools.Statics.Crystal]) !== 'object') this.Cache[cname][MaelstromTools.Statics.Crystal] = {}; // this.Cache[cname] can be created inside different namespaces
                                    if (typeof (this.Cache[cname][MaelstromTools.Statics.Power]) !== 'object') this.Cache[cname][MaelstromTools.Statics.Power] = {}; // like the RepairTime etc... without those objs
                                    if (typeof (this.Cache[cname][MaelstromTools.Statics.Dollar]) !== 'object') this.Cache[cname][MaelstromTools.Statics.Dollar] = {};

                                    this.Cache[cname]["ProductionStopped"] = ncity.get_IsGhostMode();
                                    this.Cache[cname]["PackagesStopped"] = (ncity.get_hasCooldown() || ncity.get_IsGhostMode());
                                    this.Cache[cname][MaelstromTools.Statics.Tiberium]["Delta"] = ncity.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Tiberium, false, false); // (production.d[ClientLib.Base.EResourceType.Tiberium]['Delta'] * serverTime.get_StepsPerHour());
                                    this.Cache[cname][MaelstromTools.Statics.Tiberium]["ExtraBonusDelta"] = ncity.GetResourceBonusGrowPerHour(ClientLib.Base.EResourceType.Tiberium); //(production.d[ClientLib.Base.EResourceType.Tiberium]['ExtraBonusDelta'] * serverTime.get_StepsPerHour());
                                    this.Cache[cname][MaelstromTools.Statics.Tiberium]["POI"] = alliance.GetPOIBonusFromResourceType(ClientLib.Base.EResourceType.Tiberium);
                                    this.Cache[cname][MaelstromTools.Statics.Crystal]["Delta"] = ncity.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Crystal, false, false); //(production.d[ClientLib.Base.EResourceType.Crystal]['Delta'] * serverTime.get_StepsPerHour());
                                    this.Cache[cname][MaelstromTools.Statics.Crystal]["ExtraBonusDelta"] = ncity.GetResourceBonusGrowPerHour(ClientLib.Base.EResourceType.Crystal); //(production.d[ClientLib.Base.EResourceType.Crystal]['ExtraBonusDelta'] * serverTime.get_StepsPerHour());
                                    this.Cache[cname][MaelstromTools.Statics.Crystal]["POI"] = alliance.GetPOIBonusFromResourceType(ClientLib.Base.EResourceType.Crystal);
                                    this.Cache[cname][MaelstromTools.Statics.Power]["Delta"] = ncity.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Power, false, false); //(production.d[ClientLib.Base.EResourceType.Power]['Delta'] * serverTime.get_StepsPerHour());
                                    this.Cache[cname][MaelstromTools.Statics.Power]["ExtraBonusDelta"] = ncity.GetResourceBonusGrowPerHour(ClientLib.Base.EResourceType.Power); // (production.d[ClientLib.Base.EResourceType.Power]['ExtraBonusDelta'] * serverTime.get_StepsPerHour());
                                    this.Cache[cname][MaelstromTools.Statics.Power]["POI"] = alliance.GetPOIBonusFromResourceType(ClientLib.Base.EResourceType.Power);
                                    this.Cache[cname][MaelstromTools.Statics.Dollar]["Delta"] = ClientLib.Base.Resource.GetResourceGrowPerHour(ncity.get_CityCreditsProduction(), false); // (ncity.get_CityCreditsProduction()['Delta'] * serverTime.get_StepsPerHour());
                                    this.Cache[cname][MaelstromTools.Statics.Dollar]["ExtraBonusDelta"] = ClientLib.Base.Resource.GetResourceBonusGrowPerHour(ncity.get_CityCreditsProduction(), false); // (ncity.get_CityCreditsProduction()['ExtraBonusDelta'] * serverTime.get_StepsPerHour());
                                    this.Cache[cname][MaelstromTools.Statics.Dollar]["POI"] = 0;
                                    this.Cache[cname]["BaseLevel"] = MaelstromTools.Wrapper.GetBaseLevel(ncity);
                                    if (onlyForCity != null && onlyForCity == cname) return this.Cache[cname];
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.Production.updateCache: ", e);
                            }
                        },

                        createProductionLabels2: function (rowIdx, colIdx, cityName, resourceType)
                        {
                            try
                            {
                                if (cityName == "-Total-")
                                {
                                    var Totals = Object();
                                    Totals["Delta"] = 0;
                                    Totals["ExtraBonusDelta"] = 0;
                                    Totals["POI"] = 0;
                                    Totals["Total"] = 0;

                                    for (var cname in this.Cache)
                                    {
                                        Totals["Delta"] += this.Cache[cname][resourceType]['Delta'];
                                        Totals["ExtraBonusDelta"] += this.Cache[cname][resourceType]['ExtraBonusDelta'];
                                        Totals["POI"] += this.Cache[cname][resourceType]['POI'];
                                    }
                                    Totals["Total"] = Totals['Delta'] + Totals['ExtraBonusDelta'] + Totals['POI'];

                                    rowIdx++;

                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx++, colIdx, MaelstromTools.Wrapper.FormatNumbersCompact(Totals['Delta']), 80, 'right', 'bold');
                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx++, colIdx, MaelstromTools.Wrapper.FormatNumbersCompact(Totals['ExtraBonusDelta']), 80, 'right', 'bold');
                                    if (resourceType != MaelstromTools.Statics.Dollar)
                                    {
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx++, colIdx, MaelstromTools.Wrapper.FormatNumbersCompact(Totals['POI']), 80, 'right', 'bold');
                                    } else
                                    {
                                        rowIdx++;
                                    }
                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx++, colIdx, MaelstromTools.Wrapper.FormatNumbersCompact(Totals['Total']), 80, 'right', 'bold');
                                } else if (cityName == "-Labels-")
                                {
                                    MaelstromTools.Util.addImage(this.Widget, rowIdx++, colIdx, MaelstromTools.Util.getImage(resourceType));
                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx++, colIdx, "Continuous", 100, 'left');
                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx++, colIdx, "Bonus", 100, 'left');
                                    if (resourceType != MaelstromTools.Statics.Dollar)
                                    {
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx++, colIdx, "POI", 100, 'left');
                                    } else
                                    {
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx++, colIdx, "Total / BaseLevel", 100, 'left');
                                    }
                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx++, colIdx, "Total / h", 100, 'left');
                                } else
                                {
                                    var cityCache = this.Cache[cityName];
                                    if (rowIdx > 2)
                                    {
                                        rowIdx++;
                                    }
                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx++, colIdx, MaelstromTools.Wrapper.FormatNumbersCompact(cityCache[resourceType]['Delta']), 80, 'right', null, ((cityCache["ProductionStopped"] || cityCache[resourceType]['Delta'] == 0) ? "red" : "white"));
                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx++, colIdx, MaelstromTools.Wrapper.FormatNumbersCompact(cityCache[resourceType]['ExtraBonusDelta']), 80, 'right', null, ((cityCache["PackagesStopped"] || cityCache[resourceType]['ExtraBonusDelta'] == 0) ? "red" : "white"));
                                    if (resourceType != MaelstromTools.Statics.Dollar)
                                    {
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx++, colIdx, MaelstromTools.Wrapper.FormatNumbersCompact(cityCache[resourceType]['POI']), 80, 'right', null, (cityCache[resourceType]['POI'] == 0 ? "red" : "white"));
                                    } else
                                    {
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx++, colIdx, MaelstromTools.Wrapper.FormatNumbersCompact((cityCache[resourceType]['Delta'] + cityCache[resourceType]['ExtraBonusDelta'] + cityCache[resourceType]['POI']) / cityCache["BaseLevel"]), 80, 'right');
                                    }
                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx++, colIdx, MaelstromTools.Wrapper.FormatNumbersCompact(cityCache[resourceType]['Delta'] + cityCache[resourceType]['ExtraBonusDelta'] + cityCache[resourceType]['POI']), 80, 'right', 'bold');
                                }
                                return rowIdx;
                            } catch (e)
                            {
                                console.log("MaelstromTools.Production.createProductionLabels2: ", e);
                            }
                        },

                        setWidgetLabels: function ()
                        {
                            try
                            {
                                this.Widget.removeAll();

                                var rowIdx = 1;
                                var colIdx = 1;

                                rowIdx = this.createProductionLabels2(rowIdx, colIdx, "-Labels-", MaelstromTools.Statics.Tiberium);
                                rowIdx = this.createProductionLabels2(rowIdx, colIdx, "-Labels-", MaelstromTools.Statics.Crystal);
                                rowIdx = this.createProductionLabels2(rowIdx, colIdx, "-Labels-", MaelstromTools.Statics.Power);
                                rowIdx = this.createProductionLabels2(rowIdx, colIdx, "-Labels-", MaelstromTools.Statics.Dollar);

                                colIdx++;
                                for (var cityName in this.Cache)
                                {
                                    rowIdx = 1;
                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx++, colIdx, cityName, 80, 'right');

                                    rowIdx = this.createProductionLabels2(rowIdx, colIdx, cityName, MaelstromTools.Statics.Tiberium);
                                    rowIdx = this.createProductionLabels2(rowIdx, colIdx, cityName, MaelstromTools.Statics.Crystal);
                                    rowIdx = this.createProductionLabels2(rowIdx, colIdx, cityName, MaelstromTools.Statics.Power);
                                    rowIdx = this.createProductionLabels2(rowIdx, colIdx, cityName, MaelstromTools.Statics.Dollar);

                                    MaelstromTools.Util.addElement(this.Widget, rowIdx, colIdx++, MaelstromTools.Util.getAccessBaseButton(cityName));
                                }

                                rowIdx = 1;
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx, "Total / h", 80, 'right', 'bold');

                                rowIdx = this.createProductionLabels2(rowIdx, colIdx, "-Total-", MaelstromTools.Statics.Tiberium);
                                rowIdx = this.createProductionLabels2(rowIdx, colIdx, "-Total-", MaelstromTools.Statics.Crystal);
                                rowIdx = this.createProductionLabels2(rowIdx, colIdx, "-Total-", MaelstromTools.Statics.Power);
                                rowIdx = this.createProductionLabels2(rowIdx, colIdx, "-Total-", MaelstromTools.Statics.Dollar);
                            } catch (e)
                            {
                                console.log("MaelstromTools.Production.setWidgetLabels: ", e);
                            }
                        }
                    }
                });

                // define RepairTime
                qx.Class.define("MaelstromTools.RepairTime", {
                    type: "singleton",
                    extend: MaelstromTools.DefaultObject,
                    members: {

                        updateCache: function ()
                        {
                            try
                            {
                                MT_Cache.updateCityCache();
                                this.Cache = Object();

                                for (var cname in MT_Cache.Cities)
                                {
                                    var ncity = MT_Cache.Cities[cname].Object;
                                    var RepLargest = '';

                                    this.Cache[cname] = Object();
                                    this.Cache[cname]["RepairTime"] = Object();
                                    this.Cache[cname]["Repaircharge"] = Object();
                                    this.Cache[cname]["Repaircharge"]["Smallest"] = 999999999;
                                    this.Cache[cname]["RepairTime"]["Largest"] = 0;

                                    this.Cache[cname]["RepairTime"][MaelstromTools.Statics.Infantry] = ncity.get_CityUnitsData().GetRepairTimeFromEUnitGroup(ClientLib.Data.EUnitGroup.Infantry, false);
                                    this.Cache[cname]["RepairTime"][MaelstromTools.Statics.Vehicle] = ncity.get_CityUnitsData().GetRepairTimeFromEUnitGroup(ClientLib.Data.EUnitGroup.Vehicle, false);
                                    this.Cache[cname]["RepairTime"][MaelstromTools.Statics.Aircraft] = ncity.get_CityUnitsData().GetRepairTimeFromEUnitGroup(ClientLib.Data.EUnitGroup.Aircraft, false);
                                    this.Cache[cname]["RepairTime"]["Maximum"] = ncity.GetResourceMaxStorage(ClientLib.Base.EResourceType.RepairChargeInf);
                                    this.Cache[cname]["Repaircharge"][MaelstromTools.Statics.Infantry] = ncity.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeInf);
                                    this.Cache[cname]["Repaircharge"][MaelstromTools.Statics.Vehicle] = ncity.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeVeh);
                                    this.Cache[cname]["Repaircharge"][MaelstromTools.Statics.Aircraft] = ncity.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeAir);

                                    if (this.Cache[cname]["Repaircharge"][MaelstromTools.Statics.Infantry] < this.Cache[cname]["Repaircharge"]["Smallest"])
                                    {
                                        this.Cache[cname]["Repaircharge"]["Smallest"] = this.Cache[cname]["Repaircharge"][MaelstromTools.Statics.Infantry];
                                    }
                                    if (this.Cache[cname]["Repaircharge"][MaelstromTools.Statics.Vehicle] < this.Cache[cname]["Repaircharge"]["Smallest"])
                                    {
                                        this.Cache[cname]["Repaircharge"]["Smallest"] = this.Cache[cname]["Repaircharge"][MaelstromTools.Statics.Vehicle];
                                    }
                                    if (this.Cache[cname]["Repaircharge"][MaelstromTools.Statics.Aircraft] < this.Cache[cname]["Repaircharge"]["Smallest"])
                                    {
                                        this.Cache[cname]["Repaircharge"]["Smallest"] = this.Cache[cname]["Repaircharge"][MaelstromTools.Statics.Aircraft];
                                    }

                                    if (this.Cache[cname]["RepairTime"][MaelstromTools.Statics.Infantry] > this.Cache[cname]["RepairTime"]["Largest"])
                                    {
                                        this.Cache[cname]["RepairTime"]["Largest"] = this.Cache[cname]["RepairTime"][MaelstromTools.Statics.Infantry];
                                        RepLargest = "Infantry";
                                    }
                                    if (this.Cache[cname]["RepairTime"][MaelstromTools.Statics.Vehicle] > this.Cache[cname]["RepairTime"]["Largest"])
                                    {
                                        this.Cache[cname]["RepairTime"]["Largest"] = this.Cache[cname]["RepairTime"][MaelstromTools.Statics.Vehicle];
                                        RepLargest = "Vehicle";
                                    }
                                    if (this.Cache[cname]["RepairTime"][MaelstromTools.Statics.Aircraft] > this.Cache[cname]["RepairTime"]["Largest"])
                                    {
                                        this.Cache[cname]["RepairTime"]["Largest"] = this.Cache[cname]["RepairTime"][MaelstromTools.Statics.Aircraft];
                                        RepLargest = "Aircraft";
                                    }

                                    //PossibleAttacks and MaxAttacks fixes
                                    var offHealth = ncity.GetOffenseConditionInPercent();
                                    if (RepLargest !== '')
                                    {
                                        this.Cache[cname]["RepairTime"]["LargestDiv"] = this.Cache[cname]["RepairTime"][RepLargest];
                                        var i = Math.ceil(this.Cache[cname]["Repaircharge"].Smallest / this.Cache[cname]["RepairTime"].LargestDiv); //fix
                                        var j = this.Cache[cname]["Repaircharge"].Smallest / this.Cache[cname]["RepairTime"].LargestDiv;
                                        if (offHealth !== 100) { i--; i += '*'; } // Decrease number of attacks by 1 when unit unhealthy. Additional visual info: asterisk when units aren't healthy
                                        this.Cache[cname]["RepairTime"]["PossibleAttacks"] = i;
                                        var k = this.Cache[cname]["RepairTime"].Maximum / this.Cache[cname]["RepairTime"].LargestDiv;
                                        this.Cache[cname]["RepairTime"]["MaxAttacks"] = Math.ceil(k); //fix
                                    } else
                                    {
                                        this.Cache[cname]["RepairTime"]["LargestDiv"] = 0;
                                        this.Cache[cname]["RepairTime"]["PossibleAttacks"] = 0;
                                        this.Cache[cname]["RepairTime"]["MaxAttacks"] = 0;
                                    }

                                    var unitsData = ncity.get_CityUnitsData();
                                    this.Cache[cname]["Base"] = Object();
                                    this.Cache[cname]["Base"]["Level"] = MaelstromTools.Wrapper.GetBaseLevel(ncity);
                                    this.Cache[cname]["Base"]["UnitLimit"] = ncity.GetBuildingSlotLimit(); //ncity.GetNumBuildings();
                                    this.Cache[cname]["Base"]["TotalHeadCount"] = ncity.GetBuildingSlotCount();
                                    this.Cache[cname]["Base"]["FreeHeadCount"] = this.Cache[cname]["Base"]["UnitLimit"] - this.Cache[cname]["Base"]["TotalHeadCount"];
                                    this.Cache[cname]["Base"]["HealthInPercent"] = ncity.GetBuildingsConditionInPercent();

                                    this.Cache[cname]["Offense"] = Object();
                                    this.Cache[cname]["Offense"]["Level"] = (Math.floor(ncity.get_LvlOffense() * 100) / 100).toFixed(2);
                                    this.Cache[cname]["Offense"]["UnitLimit"] = unitsData.get_UnitLimitOffense();
                                    this.Cache[cname]["Offense"]["TotalHeadCount"] = unitsData.get_TotalOffenseHeadCount();
                                    this.Cache[cname]["Offense"]["FreeHeadCount"] = unitsData.get_FreeOffenseHeadCount();
                                    this.Cache[cname]["Offense"]["HealthInPercent"] = offHealth > 0 ? offHealth : 0;

                                    this.Cache[cname]["Defense"] = Object();
                                    this.Cache[cname]["Defense"]["Level"] = (Math.floor(ncity.get_LvlDefense() * 100) / 100).toFixed(2);
                                    this.Cache[cname]["Defense"]["UnitLimit"] = unitsData.get_UnitLimitDefense();
                                    this.Cache[cname]["Defense"]["TotalHeadCount"] = unitsData.get_TotalDefenseHeadCount();
                                    this.Cache[cname]["Defense"]["FreeHeadCount"] = unitsData.get_FreeDefenseHeadCount();
                                    this.Cache[cname]["Defense"]["HealthInPercent"] = ncity.GetDefenseConditionInPercent() > 0 ? ncity.GetDefenseConditionInPercent() : 0;
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.RepairTime.updateCache: ", e);
                            }
                        },

                        setWidgetLabels: function ()
                        {
                            try
                            {
                                this.Widget.removeAll();
                                var rowIdx = 1;

                                rowIdx = this.createOverviewLabels(rowIdx);
                                rowIdx = this.createRepairchargeLabels(rowIdx);
                            } catch (e)
                            {
                                console.log("MaelstromTools.RepairTime.setWidgetLabels: ", e);
                            }
                        },

                        createRepairchargeLabels: function (rowIdx)
                        {
                            try
                            {
                                var colIdx = 2;
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx++, colIdx++, "Repaircharges", null, 'left', null, null, 3);
                                colIdx = 2;

                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Statics.Infantry, 60, 'right');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Statics.Vehicle, 60, 'right');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Statics.Aircraft, 60, 'right');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Repairtime", 80, 'right');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Attacks", 60, 'right');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Next at", 80, 'right');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Max+1 at", 80, 'right');

                                rowIdx++;
                                for (var cityName in this.Cache)
                                {
                                    var cityCache = this.Cache[cityName];
                                    if (cityCache.Offense.UnitLimit == 0)
                                    {
                                        continue;
                                    }
                                    colIdx = 1;
                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, cityName, 80, 'left');

                                    // Skip bases with no armies
                                    if (cityCache.Offense.UnitLimit > 0)
                                    {
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatTimespan(cityCache.RepairTime.Infantry), 60, 'right', null, (cityCache.RepairTime.Infantry == cityCache.RepairTime.LargestDiv ? "yellow" : "white"));
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatTimespan(cityCache.RepairTime.Vehicle), 60, 'right', null, (cityCache.RepairTime.Vehicle == cityCache.RepairTime.LargestDiv ? "yellow" : "white"));
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatTimespan(cityCache.RepairTime.Aircraft), 60, 'right', null, (cityCache.RepairTime.Aircraft == cityCache.RepairTime.LargestDiv ? "yellow" : "white"));
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatTimespan(cityCache.Repaircharge.Smallest), 80, 'right');
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, cityCache.RepairTime.PossibleAttacks + " / " + cityCache.RepairTime.MaxAttacks, 60, 'right', null, (cityCache.Offense.HealthInPercent !== 100 ? 'red' : null)); // mark red when unhealthy
                                        var i = cityCache.RepairTime.LargestDiv * cityCache.RepairTime.PossibleAttacks;
                                        var j = cityCache.RepairTime.LargestDiv * cityCache.RepairTime.MaxAttacks;
                                        (i > 0) ? MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatTimespan(i), 80, 'right', null, (i > cityCache.RepairTime.Maximum ? "yellow" : "white")) : colIdx++; /// yellow if more than Maximum RT
                                        (j > 0) ? MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatTimespan(j), 80, 'right') : colIdx++;
                                    } else
                                    {
                                        colIdx += 7;
                                    }

                                    colIdx += 4;
                                    MaelstromTools.Util.addElement(this.Widget, rowIdx, colIdx++, MaelstromTools.Util.getAccessBaseButton(cityName, PerforceChangelist >= 376877 ? ClientLib.Data.PlayerAreaViewMode.pavmPlayerOffense : webfrontend.gui.PlayArea.PlayArea.modes.EMode_PlayerOffense));
                                    rowIdx += 2;
                                }

                                return rowIdx;
                            } catch (e)
                            {
                                console.log("MaelstromTools.RepairTime.createRepairchargeLabels: ", e);
                            }
                        },

                        createOverviewLabels: function (rowIdx)
                        {
                            try
                            {
                                var colIdx = 2;

                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx, "Base", 60, 'right');
                                colIdx += 3;
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx, "Defense", 60, 'right');
                                colIdx += 3;
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx, "Army", 60, 'right');

                                rowIdx++;
                                colIdx = 2;

                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Level", 60, 'right');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Buildings", 60, 'right');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Health", 60, 'right');

                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Level", 60, 'right');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Buildings", 60, 'right');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Health", 60, 'right');

                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Level", 60, 'right');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Units", 60, 'right');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Health", 60, 'right');

                                rowIdx++;
                                for (var cityName in this.Cache)
                                {
                                    var cityCache = this.Cache[cityName];
                                    colIdx = 1;

                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, cityName, 80, 'left');

                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, cityCache.Base.Level, 60, 'right');
                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, cityCache.Base.TotalHeadCount + " / " + cityCache.Base.UnitLimit, 60, 'right', null, (cityCache.Base.FreeHeadCount >= 1 ? "red" : "white"));
                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, cityCache.Base.HealthInPercent + "%", 60, 'right', null, (cityCache.Base.HealthInPercent < 25 ? "red" : (cityCache.Base.HealthInPercent < 100 ? "yellow" : "white")));

                                    if (cityCache.Defense.UnitLimit > 0)
                                    {
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, cityCache.Defense.Level, 60, 'right');
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, cityCache.Defense.TotalHeadCount + " / " + cityCache.Defense.UnitLimit, 60, 'right', null, (cityCache.Defense.FreeHeadCount >= 5 ? "red" : (cityCache.Defense.FreeHeadCount >= 3 ? "yellow" : "white")));
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, cityCache.Defense.HealthInPercent + "%", 60, 'right', null, (cityCache.Defense.HealthInPercent < 25 ? "red" : (cityCache.Defense.HealthInPercent < 100 ? "yellow" : "white")));
                                    } else
                                    {
                                        colIdx += 3;
                                    }

                                    // Skip bases with no armies
                                    if (cityCache.Offense.UnitLimit > 0)
                                    {
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, cityCache.Offense.Level, 60, 'right');
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, cityCache.Offense.TotalHeadCount + " / " + cityCache.Offense.UnitLimit, 60, 'right', null, (cityCache.Offense.FreeHeadCount >= 10 ? "red" : (cityCache.Offense.FreeHeadCount >= 5 ? "yellow" : "white")));
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, cityCache.Offense.HealthInPercent + "%", 60, 'right', null, (cityCache.Offense.HealthInPercent < 25 ? "red" : (cityCache.Offense.HealthInPercent < 100 ? "yellow" : "white")));
                                    } else
                                    {
                                        colIdx += 3;
                                    }

                                    MaelstromTools.Util.addElement(this.Widget, rowIdx, colIdx++, MaelstromTools.Util.getAccessBaseButton(cityName));
                                    rowIdx += 2;
                                }
                                return rowIdx;
                            } catch (e)
                            {
                                console.log("MaelstromTools.RepairTime.createOverviewLabels: ", e);
                            }
                        }

                    }
                });

                // define ResourceOverview
                qx.Class.define("MaelstromTools.ResourceOverview", {
                    type: "singleton",
                    extend: MaelstromTools.DefaultObject,
                    members: {
                        Table: null,
                        Model: null,

                        updateCache: function ()
                        {
                            try
                            {
                                MT_Cache.updateCityCache();
                                this.Cache = Object();

                                for (var cname in MT_Cache.Cities)
                                {
                                    var ncity = MT_Cache.Cities[cname].Object;
                                    var mtime = ClientLib.Data.MainData.GetInstance().get_Time();

                                    this.Cache[cname] = Object();
                                    this.Cache[cname][MaelstromTools.Statics.Tiberium] = ncity.GetResourceCount(ClientLib.Base.EResourceType.Tiberium);
                                    this.Cache[cname][MaelstromTools.Statics.Tiberium + "Max"] = ncity.GetResourceMaxStorage(ClientLib.Base.EResourceType.Tiberium);
                                    this.Cache[cname][MaelstromTools.Statics.Tiberium + "Full"] = mtime.GetJSStepTime(ncity.GetResourceStorageFullStep(ClientLib.Base.EResourceType.Tiberium));
                                    this.Cache[cname][MaelstromTools.Statics.Crystal] = ncity.GetResourceCount(ClientLib.Base.EResourceType.Crystal);
                                    this.Cache[cname][MaelstromTools.Statics.Crystal + "Max"] = ncity.GetResourceMaxStorage(ClientLib.Base.EResourceType.Crystal);
                                    this.Cache[cname][MaelstromTools.Statics.Crystal + "Full"] = mtime.GetJSStepTime(ncity.GetResourceStorageFullStep(ClientLib.Base.EResourceType.Crystal));
                                    this.Cache[cname][MaelstromTools.Statics.Power] = ncity.GetResourceCount(ClientLib.Base.EResourceType.Power);
                                    this.Cache[cname][MaelstromTools.Statics.Power + "Max"] = ncity.GetResourceMaxStorage(ClientLib.Base.EResourceType.Power);
                                    this.Cache[cname][MaelstromTools.Statics.Power + "Full"] = mtime.GetJSStepTime(ncity.GetResourceStorageFullStep(ClientLib.Base.EResourceType.Power));
                                }

                            } catch (e)
                            {
                                console.log("MaelstromTools.ResourceOverview.updateCache: ", e);
                            }
                        },

                        setWidgetLabels: function ()
                        {
                            try
                            {
                                this.Widget.removeAll();

                                var first = true;
                                var rowIdx = 2;
                                var Totals = Object();
                                var colIdx = 1;
                                Totals[MaelstromTools.Statics.Tiberium] = 0;
                                Totals[MaelstromTools.Statics.Crystal] = 0;
                                Totals[MaelstromTools.Statics.Power] = 0;
                                Totals[MaelstromTools.Statics.Tiberium + "Max"] = 0;
                                Totals[MaelstromTools.Statics.Power + "Max"] = 0;

                                for (var cityName in this.Cache)
                                {
                                    var cityCache = this.Cache[cityName];
                                    Totals[MaelstromTools.Statics.Tiberium] += cityCache[MaelstromTools.Statics.Tiberium];
                                    Totals[MaelstromTools.Statics.Crystal] += cityCache[MaelstromTools.Statics.Crystal];
                                    Totals[MaelstromTools.Statics.Power] += cityCache[MaelstromTools.Statics.Power];
                                    Totals[MaelstromTools.Statics.Tiberium + "Max"] += cityCache[MaelstromTools.Statics.Tiberium + 'Max'];
                                    Totals[MaelstromTools.Statics.Power + "Max"] += cityCache[MaelstromTools.Statics.Power + 'Max'];

                                    colIdx = 1;

                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, cityName, 100, 'left');
                                    if (first)
                                    {
                                        MaelstromTools.Util.addLabel(this.Widget, 1, colIdx, 'Max. storage', 80, 'left');
                                    }
                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatNumbersCompact(cityCache[MaelstromTools.Statics.Tiberium + 'Max']), 80, 'right');

                                    if (first)
                                    {
                                        MaelstromTools.Util.addImage(this.Widget, 1, colIdx, MaelstromTools.Util.getImage(MaelstromTools.Statics.Tiberium));
                                    }
                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatNumbersCompact(cityCache[MaelstromTools.Statics.Tiberium]), 60, 'right', null, (cityCache[MaelstromTools.Statics.Tiberium] >= cityCache[MaelstromTools.Statics.Tiberium + 'Max'] ? "red" : (cityCache[MaelstromTools.Statics.Tiberium] >= (0.75 * cityCache[MaelstromTools.Statics.Tiberium + 'Max']) ? "yellow" : "white")));

                                    if (cityCache[MaelstromTools.Statics.Tiberium] < cityCache[MaelstromTools.Statics.Tiberium + 'Max'])
                                    {
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.GetDateTimeString(cityCache[MaelstromTools.Statics.Tiberium + 'Full']), 100, 'right', null, (cityCache[MaelstromTools.Statics.Tiberium] >= (0.75 * cityCache[MaelstromTools.Statics.Tiberium + 'Max']) ? "yellow" : "white"));
                                    } else
                                    {
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Storage full!", 100, 'right', null, "red");
                                    }
                                    if (first)
                                    {
                                        MaelstromTools.Util.addImage(this.Widget, 1, colIdx, MaelstromTools.Util.getImage(MaelstromTools.Statics.Crystal));
                                    }
                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatNumbersCompact(cityCache[MaelstromTools.Statics.Crystal]), 60, 'right', null, (cityCache[MaelstromTools.Statics.Crystal] >= cityCache[MaelstromTools.Statics.Crystal + 'Max'] ? "red" : (cityCache[MaelstromTools.Statics.Crystal] >= (0.75 * cityCache[MaelstromTools.Statics.Crystal + 'Max']) ? "yellow" : "white")));

                                    if (cityCache[MaelstromTools.Statics.Crystal] < cityCache[MaelstromTools.Statics.Crystal + 'Max'])
                                    {
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.GetDateTimeString(cityCache[MaelstromTools.Statics.Crystal + 'Full']), 100, 'right', null, (cityCache[MaelstromTools.Statics.Crystal] >= (0.75 * cityCache[MaelstromTools.Statics.Crystal + 'Max']) ? "yellow" : "white"));
                                    } else
                                    {
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Storage full!", 100, 'right', null, "red");
                                    }

                                    if (first)
                                    {
                                        MaelstromTools.Util.addImage(this.Widget, 1, colIdx, MaelstromTools.Util.getImage(MaelstromTools.Statics.Power));
                                    }
                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatNumbersCompact(cityCache[MaelstromTools.Statics.Power]), 60, 'right', null, (cityCache[MaelstromTools.Statics.Power] >= cityCache[MaelstromTools.Statics.Power + 'Max'] ? "red" : (cityCache[MaelstromTools.Statics.Power] >= (0.75 * cityCache[MaelstromTools.Statics.Power + 'Max']) ? "yellow" : "white")));

                                    if (first)
                                    {
                                        MaelstromTools.Util.addLabel(this.Widget, 1, colIdx, 'Storage', 80, 'left');
                                    }
                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatNumbersCompact(cityCache[MaelstromTools.Statics.Power + 'Max']), 80, 'right');

                                    if (cityCache[MaelstromTools.Statics.Power] < cityCache[MaelstromTools.Statics.Power + 'Max'])
                                    {
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.GetDateTimeString(cityCache[MaelstromTools.Statics.Power + 'Full']), 100, 'right', null, (cityCache[MaelstromTools.Statics.Power] >= (0.75 * cityCache[MaelstromTools.Statics.Power + 'Max']) ? "yellow" : "white"));
                                    } else
                                    {
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Storage full!", 100, 'right', null, "red");
                                    }


                                    MaelstromTools.Util.addElement(this.Widget, rowIdx, colIdx++, MaelstromTools.Util.getAccessBaseButton(cityName));
                                    rowIdx++;
                                    first = false;
                                }

                                colIdx = 1;
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Total resources", 100, 'left', 'bold');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatNumbersCompact(Totals[MaelstromTools.Statics.Tiberium + 'Max']), 80, 'right', 'bold');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatNumbersCompact(Totals[MaelstromTools.Statics.Tiberium]), 60, 'right', 'bold');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, Math.round(Totals[MaelstromTools.Statics.Tiberium] / Totals[MaelstromTools.Statics.Tiberium + 'Max'] * 100) + '%', 100, 'center', 'bold');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatNumbersCompact(Totals[MaelstromTools.Statics.Crystal]), 60, 'right', 'bold');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, Math.round(Totals[MaelstromTools.Statics.Crystal] / Totals[MaelstromTools.Statics.Tiberium + 'Max'] * 100) + '%', 100, 'center', 'bold');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatNumbersCompact(Totals[MaelstromTools.Statics.Power]), 60, 'right', 'bold');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.FormatNumbersCompact(Totals[MaelstromTools.Statics.Power + 'Max']), 80, 'right', 'bold');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, Math.round(Totals[MaelstromTools.Statics.Power] / Totals[MaelstromTools.Statics.Power + 'Max'] * 100) + '%', 100, 'center', 'bold');
                            } catch (e)
                            {
                                console.log("MaelstromTools.ResourceOverview.setWidgetLabels: ", e);
                            }
                        }
                    }
                });

                // define BaseStatus
                qx.Class.define("MaelstromTools.BaseStatus", {
                    type: "singleton",
                    extend: MaelstromTools.DefaultObject,
                    members: {
                        CityMenuButtons: null,
                        updateCache: function ()
                        {
                            try
                            {
                                MT_Cache.updateCityCache();
                                this.Cache = Object();

                                for (var cname in MT_Cache.Cities)
                                {
                                    var ncity = MT_Cache.Cities[cname].Object;
                                    var player = ClientLib.Data.MainData.GetInstance().get_Player();
                                    var supportData = ncity.get_SupportData();
                                    //System.String get_PlayerName ()
                                    this.Cache[cname] = Object();
                                    // Movement lock
                                    this.Cache[cname]["HasCooldown"] = ncity.get_hasCooldown();
                                    this.Cache[cname]["CooldownEnd"] = Math.max(ncity.get_MoveCooldownEndStep(), ncity.get_MoveRestictionEndStep());
                                    this.Cache[cname]["MoveCooldownEnd"] = ncity.get_MoveCooldownEndStep();
                                    this.Cache[cname]["MoveLockdownEnd"] = ncity.get_MoveRestictionEndStep();
                                    this.Cache[cname]["IsProtected"] = ncity.get_isProtected();
                                    this.Cache[cname]["ProtectionEnd"] = ncity.get_ProtectionEndStep();
                                    this.Cache[cname]["IsProtected"] = ncity.get_ProtectionEndStep();
                                    this.Cache[cname]["IsAlerted"] = ncity.get_isAlerted();

                                    // Supportweapon
                                    if (supportData == null)
                                    {
                                        this.Cache[cname]["HasSupportWeapon"] = false;
                                    } else
                                    {
                                        this.Cache[cname]["HasSupportWeapon"] = true;
                                        if (ncity.get_SupportDedicatedBaseId() > 0)
                                        {
                                            this.Cache[cname]["SupportedCityId"] = ncity.get_SupportDedicatedBaseId();
                                            this.Cache[cname]["SupportedCityName"] = ncity.get_SupportDedicatedBaseName();
                                            var coordId = ncity.get_SupportDedicatedBaseCoordId();
                                            this.Cache[cname]["SupportedCityX"] = (coordId & 0xffff);
                                            this.Cache[cname]["SupportedCityY"] = ((coordId >> 0x10) & 0xffff);
                                        } else
                                        { // prevent reference to undefined property ReferenceError
                                            this.Cache[cname]["SupportedCityId"] = null;
                                            this.Cache[cname]["SupportedCityName"] = null;
                                            this.Cache[cname]["SupportedCityX"] = null;
                                            this.Cache[cname]["SupportedCityY"] = null;
                                        }
                                        this.Cache[cname]["SupportRange"] = MaelstromTools.Wrapper.GetSupportWeaponRange(ncity.get_SupportWeapon());
                                        var techName = ClientLib.Base.Tech.GetTechNameFromTechId(supportData.get_Type(), player.get_Faction());
                                        this.Cache[cname]["SupportName"] = ClientLib.Base.Tech.GetProductionBuildingNameFromFaction(techName, player.get_Faction());
                                        this.Cache[cname]["SupportLevel"] = supportData.get_Level();
                                    }
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.BaseStatus.updateCache: ", e);
                            }
                        },

                        setWidgetLabels: function ()
                        {
                            try
                            {
                                this.Widget.removeAll();
                                var rowIdx = 1;
                                var colIdx = 2;

                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Cooldown", 85, 'left');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Protection", 85, 'left');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Available weapon", 240, 'left');
                                MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "Calibrated on", 240, 'left');

                                var rowIdxRecall = rowIdx;
                                var colIdxRecall = 0;
                                var supportWeaponCount = 0;

                                rowIdx++;
                                for (var cityName in this.Cache)
                                {
                                    var cityCache = this.Cache[cityName];
                                    colIdx = 1;

                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, cityName, 100, 'left', null, (cityCache.IsAlerted ? 'red' : null));

                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.GetStepTime(cityCache.CooldownEnd), 70, 'right');
                                    MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, MaelstromTools.Wrapper.GetStepTime(cityCache.ProtectionEnd), 70, 'right');

                                    if (!cityCache.HasSupportWeapon)
                                    {
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, "none", 240, 'left');
                                        colIdx += 2;
                                    } else
                                    {
                                        supportWeaponCount++;
                                        MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, cityCache.SupportName + " (" + cityCache.SupportLevel + ")", 240, 'left');

                                        if (cityCache.SupportedCityId > 0)
                                        {
                                            MaelstromTools.Util.addLabel(this.Widget, rowIdx, colIdx++, cityCache.SupportedCityName, 240, 'left');
                                            colIdxRecall = colIdx;
                                            MaelstromTools.Util.addElement(this.Widget, rowIdx, colIdx++, this.getRecallButton(cityName));
                                        } else
                                        {
                                            colIdx += 2;
                                        }
                                    }

                                    MaelstromTools.Util.addElement(this.Widget, rowIdx, colIdx++, MaelstromTools.Util.getAccessBaseButton(cityName));
                                    MaelstromTools.Util.addElement(this.Widget, rowIdx, colIdx++, MaelstromTools.Util.getFocusBaseButton(cityName));

                                    rowIdx++;
                                }

                                if (supportWeaponCount > 0 && colIdxRecall > 0)
                                {
                                    MaelstromTools.Util.addElement(this.Widget, rowIdxRecall, colIdxRecall, this.getRecallAllButton());
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.BaseStatus.setWidgetLabels: ", e);
                            }
                        },

                        getRecallAllButton: function ()
                        {
                            var button = new qx.ui.form.Button("Recall all").set({
                                appearance: "button-text-small",
                                toolTipText: "Recall all support weapons",
                                width: 100,
                                height: 20
                            });
                            button.addListener("execute", function (e)
                            {
                                MaelstromTools.Util.recallAllSupport();
                            }, this);
                            return button;
                        },

                        getRecallButton: function (cityName)
                        {
                            var button = new qx.ui.form.Button("Recall").set({
                                appearance: "button-text-small",
                                toolTipText: "Recall support to " + cityName,
                                width: 100,
                                height: 20
                            });
                            button.addListener("execute", function (e)
                            {
                                MaelstromTools.Util.recallSupport(cityName);
                            }, this);
                            return button;
                        }
                    }
                });

                // define Statics
                qx.Class.define("MaelstromTools.Statics", {
                    type: "static",
                    statics: {
                        Tiberium: 'Tiberium',
                        Crystal: 'Crystal',
                        Power: 'Power',
                        Dollar: 'Dollar',
                        Research: 'Research',
                        Vehicle: "Vehicle",
                        Aircraft: "Aircraft",
                        Infantry: "Infantry",

                        LootTypeName: function (ltype)
                        {
                            switch (ltype)
                            {
                                case ClientLib.Base.EResourceType.Tiberium:
                                    return MaelstromTools.Statics.Tiberium;
                                    break;
                                case ClientLib.Base.EResourceType.Crystal:
                                    return MaelstromTools.Statics.Crystal;
                                    break;
                                case ClientLib.Base.EResourceType.Power:
                                    return MaelstromTools.Statics.Power;
                                    break;
                                case ClientLib.Base.EResourceType.Gold:
                                    return MaelstromTools.Statics.Dollar;
                                    break;
                                default:
                                    return "";
                                    break;
                            }
                        }
                    }
                });

                // define Util
                qx.Class.define("MaelstromTools.Util", {
                    type: "static",
                    statics: {
                        ArrayUnique: function (array)
                        {
                            var o = {};
                            var l = array.length;
                            r = [];
                            for (var i = 0; i < l; i++) o[array[i]] = array[i];
                            for (var i in o) r.push(o[i]);
                            return r;
                        },

                        ArraySize: function (array)
                        {
                            var size = 0;
                            for (var key in array)
                                if (array.hasOwnProperty(key)) size++;
                            return size;
                        },

                        addLabel: function (widget, rowIdx, colIdx, value, width, textAlign, font, color, colSpan)
                        {
                            try
                            {
                                var label = new qx.ui.basic.Label().set({
                                    value: Lang.gt(value)
                                });
                                if (width)
                                {
                                    label.setWidth(width);
                                }
                                if (textAlign)
                                {
                                    label.setTextAlign(textAlign);
                                }
                                if (color)
                                {
                                    label.setTextColor(color);
                                }
                                if (font)
                                {
                                    label.setFont(font);
                                }

                                // MOD FONTSIZE
                                label.setFont("font_size_11");

                                if (!colSpan || colSpan == 0)
                                {
                                    colSpan = 1;
                                }

                                widget.add(label, {
                                    row: rowIdx,
                                    column: colIdx,
                                    colSpan: colSpan
                                });
                            } catch (e)
                            {
                                console.log("MaelstromTools.Util.addLabel: ", e);
                            }
                        },

                        addElement: function (widget, rowIdx, colIdx, element, colSpan)
                        {
                            try
                            {
                                if (!colSpan || colSpan == 0)
                                {
                                    colSpan = 1;
                                }
                                widget.add(element, {
                                    row: rowIdx,
                                    column: colIdx,
                                    colSpan: colSpan
                                });
                            } catch (e)
                            {
                                console.log("MaelstromTools.Util.addElement: ", e);
                            }
                        },

                        addImage: function (widget, rowIdx, colIdx, image)
                        {
                            try
                            {
                                widget.add(image, {
                                    row: rowIdx,
                                    column: colIdx
                                });
                            } catch (e)
                            {
                                console.log("MaelstromTools.Util.addImage: ", e);
                            }
                        },

                        getImage: function (name)
                        {
                            var image = new qx.ui.basic.Image(MT_Base.images[name]);
                            image.setScale(true);
                            image.setWidth(10);
                            image.setHeight(10);
                            return image;
                        },

                        // MOD FONTSIZE
                        getAccessBaseButton: function (cityName, viewMode)
                        {
                            try
                            {
                                var cityButton = new qx.ui.form.Button(null, MT_Base.images["AccessBase"]).set({
                                    appearance: "button-detailview-small",
                                    toolTipText: Lang.gt("Access") + " " + cityName,
                                    width: 10,
                                    height: 10,
                                    maxWidth: 10,
                                    maxHeight: 10,
                                    marginLeft: 5
                                });
                                cityButton.setUserData("cityId", MT_Cache.Cities[cityName].ID);
                                cityButton.setUserData("viewMode", viewMode);
                                cityButton.addListener("execute", function (e)
                                {
                                    MaelstromTools.Util.accessBase(e.getTarget().getUserData("cityId"), e.getTarget().getUserData("viewMode"));
                                }, this);
                                return cityButton;
                            } catch (e)
                            {
                                console.log("MaelstromTools.Util.getAccessBaseButton: ", e);
                            }
                        },

                        // MOD FONTSITE IMAGE
                        getFocusBaseButton: function (cityName)
                        {
                            try
                            {
                                var cityButton = new qx.ui.form.Button(null, MT_Base.images["FocusBase"]).set({
                                    appearance: "button-detailview-small",
                                    toolTipText: Lang.gt("Focus on") + " " + cityName,
                                    width: 10,
                                    height: 10,
                                    marginLeft: 5
                                });
                                cityButton.setUserData("cityId", MT_Cache.Cities[cityName].ID);
                                cityButton.addListener("execute", function (e)
                                {
                                    MaelstromTools.Util.focusBase(e.getTarget().getUserData("cityId"));
                                }, this);
                                return cityButton;
                            } catch (e)
                            {
                                console.log("MaelstromTools.Util.getFocusBaseButton: ", e);
                            }
                        },

                        accessBase: function (cityId, viewMode)
                        {
                            try
                            {
                                if (cityId > 0)
                                {
                                    var ncity = MaelstromTools.Wrapper.GetCity(cityId);

                                    if (ncity != null && !ncity.get_IsGhostMode())
                                    {
                                        if (viewMode)
                                        {
                                            webfrontend.gui.UtilView.openVisModeInMainWindow(viewMode, cityId, false);
                                        } else
                                        {
                                            webfrontend.gui.UtilView.openCityInMainWindow(cityId);
                                        }
                                    }
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.Util.accessBase: ", e);
                            }
                        },
                        focusBase: function (cityId)
                        {
                            try
                            {
                                if (cityId > 0)
                                {
                                    var ncity = MaelstromTools.Wrapper.GetCity(cityId);

                                    if (ncity != null && !ncity.get_IsGhostMode())
                                    {
                                        webfrontend.gui.UtilView.centerCityOnRegionViewWindow(cityId);
                                    }
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.Util.focusBase: ", e);
                            }
                        },

                        recallSupport: function (cityName)
                        {
                            try
                            {
                                var ncity = MT_Cache.Cities[cityName]["Object"];
                                ncity.RecallDedicatedSupport();
                            } catch (e)
                            {
                                console.log("MaelstromTools.Util.recallSupport: ", e);
                            }
                        },

                        recallAllSupport: function ()
                        {
                            try
                            {
                                MT_Cache.updateCityCache();
                                for (var cityName in MT_Cache.Cities)
                                {
                                    var ncity = MT_Cache.Cities[cityName]["Object"];
                                    ncity.RecallDedicatedSupport();
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.Util.recallAllSupport: ", e);
                            }
                        },

                        checkIfSupportIsAllowed: function (selectedBase)
                        {
                            try
                            {
                                if (selectedBase.get_VisObjectType() != ClientLib.Vis.VisObject.EObjectType.RegionCityType)
                                {
                                    return false;
                                }
                                // MOD ALLOW SUPPORT ON ALL CITIES
                                // if (selectedBase.get_Type() != ClientLib.Vis.Region.RegionCity.ERegionCityType.Own && selectedBase.get_Type() != ClientLib.Vis.Region.RegionCity.ERegionCityType.Alliance) {
                                //    return false;
                                // }
                                return true;
                            } catch (e)
                            {
                                console.log("MaelstromTools.Util.checkIfSupportIsAllowed: ", e);
                                return false;
                            }
                        },

                        calibrateWholeSupportOnSelectedBase: function ()
                        {
                            if (this.checkIfSupportIsAllowed(MT_Cache.SelectedBaseForMenu))
                            {
                                this.calibrateWholeSupport(MT_Cache.SelectedBaseForMenu);
                            }
                        },

                        calibrateWholeSupport: function (targetRegionCity)
                        {
                            try
                            {
                                MT_Cache.updateCityCache();
                                for (var cityName in MT_Cache.Cities)
                                {
                                    var ncity = MT_Cache.Cities[cityName]["Object"];
                                    var weapon = ncity.get_SupportWeapon();

                                    if (targetRegionCity != null && weapon != null)
                                    {
                                        var dx = (ncity.get_X() - targetRegionCity.get_RawX());
                                        var dy = (ncity.get_Y() - targetRegionCity.get_RawY());
                                        var distance = ((dx * dx) + (dy * dy));
                                        var range = MaelstromTools.Wrapper.GetSupportWeaponRange(weapon);
                                        if (distance <= (range * range))
                                        {
                                            ncity.SetDedicatedSupport(targetRegionCity.get_Id());
                                        }
                                    }
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.Util.calibrateWholeSupport: ", e);
                            }
                        },
                        getResources: function (visCity)
                        {
                            // to verifier against PerforceChangelist>=376877
                            try
                            {
                                var loot = new Object();
                                if (visCity.get_X() < 0 || visCity.get_Y() < 0)
                                {
                                    loot["LoadState"] = 0;
                                    return loot;
                                }
                                var currentOwnCity = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity();

                                var distance = ClientLib.Base.Util.CalculateDistance(currentOwnCity.get_X(), currentOwnCity.get_Y(), visCity.get_RawX(), visCity.get_RawY());
                                var maxAttackDistance = ClientLib.Data.MainData.GetInstance().get_Server().get_MaxAttackDistance();
                                if (distance > maxAttackDistance)
                                {
                                    loot["LoadState"] = -1;
                                    return loot;
                                }

                                var ncity = MaelstromTools.Wrapper.GetCity(visCity.get_Id());
                                var cityUnits = ncity.get_CityUnitsData();
                                var buildings = ncity.get_Buildings().d;
                                var defenseUnits = MaelstromTools.Wrapper.GetDefenseUnits(cityUnits);
                                var buildingLoot = MaelstromTools.Util.getResourcesPart(buildings);
                                var unitLoot = MaelstromTools.Util.getResourcesPart(defenseUnits);

                                loot[MaelstromTools.Statics.Tiberium] = buildingLoot[ClientLib.Base.EResourceType.Tiberium] + unitLoot[ClientLib.Base.EResourceType.Tiberium];
                                loot[MaelstromTools.Statics.Crystal] = buildingLoot[ClientLib.Base.EResourceType.Crystal] + unitLoot[ClientLib.Base.EResourceType.Crystal];
                                loot[MaelstromTools.Statics.Dollar] = buildingLoot[ClientLib.Base.EResourceType.Gold] + unitLoot[ClientLib.Base.EResourceType.Gold];
                                loot[MaelstromTools.Statics.Research] = buildingLoot[ClientLib.Base.EResourceType.ResearchPoints] + unitLoot[ClientLib.Base.EResourceType.ResearchPoints];
                                loot["Factor"] = loot[MaelstromTools.Statics.Tiberium] + loot[MaelstromTools.Statics.Crystal] + loot[MaelstromTools.Statics.Dollar] + loot[MaelstromTools.Statics.Research];
                                loot["CPNeeded"] = currentOwnCity.CalculateAttackCommandPointCostToCoord(ncity.get_X(), ncity.get_Y());
                                loot["LoadState"] = (loot["Factor"] > 0 ? 1 : 0);
                                loot["Total"] = loot[MaelstromTools.Statics.Research] + loot[MaelstromTools.Statics.Tiberium] + loot[MaelstromTools.Statics.Crystal] + loot[MaelstromTools.Statics.Dollar];

                                return loot;
                            } catch (e)
                            {
                                console.log("MaelstromTools.Util.getResources", e);
                            }
                        },
                        getResourcesPart: function (cityEntities)
                        {
                            try
                            {
                                var loot = [0, 0, 0, 0, 0, 0, 0, 0];
                                if (cityEntities == null)
                                {
                                    return loot;
                                }

                                var objcityEntities = [];
                                if (PerforceChangelist >= 376877)
                                {
                                    //new
                                    for (var o in cityEntities) objcityEntities.push(cityEntities[o]);
                                } else
                                {
                                    //old
                                    for (var i = 0; i < cityEntities.length; i++) objcityEntities.push(cityEntities[i]);
                                }

                                for (var i = 0; i < objcityEntities.length; i++)
                                {
                                    var cityEntity = objcityEntities[i];
                                    var unitLevelRequirements = MaelstromTools.Wrapper.GetUnitLevelRequirements(cityEntity);

                                    for (var x = 0; x < unitLevelRequirements.length; x++)
                                    {
                                        loot[unitLevelRequirements[x].Type] += unitLevelRequirements[x].Count * cityEntity.get_HitpointsPercent();
                                        if (cityEntity.get_HitpointsPercent() < 1.0)
                                        {
                                            // destroyed
                                        }
                                    }
                                }

                                return loot;
                            } catch (e)
                            {
                                console.log("MaelstromTools.Util.getResourcesPart", e);
                            }
                        }
                    }
                });

                // define Wrapper
                qx.Class.define("MaelstromTools.Wrapper", {
                    type: "static",
                    statics: {
                        GetStepTime: function (step, defaultString)
                        {
                            if (!defaultString)
                            {
                                defaultString = "";
                            }
                            var endTime = ClientLib.Data.MainData.GetInstance().get_Time().GetTimespanString(step, ClientLib.Data.MainData.GetInstance().get_Time().GetServerStep());
                            if (endTime == "00:00")
                            {
                                return defaultString;
                            }
                            return endTime;
                        },

                        FormatNumbersCompact: function (value)
                        {
                            if (PerforceChangelist >= 387751)
                            {
                                //new
                                return phe.cnc.gui.util.Numbers.formatNumbersCompact(value);
                            } else
                            {
                                //old
                                return webfrontend.gui.Util.formatNumbersCompact(value);
                            }
                        },

                        GetDateTimeString: function (value)
                        {
                            return phe.cnc.Util.getDateTimeString(value);
                        },

                        FormatTimespan: function (value)
                        {
                            return ClientLib.Vis.VisMain.FormatTimespan(value);
                        },

                        GetSupportWeaponRange: function (weapon)
                        {
                            return weapon.r;
                        },

                        GetCity: function (cityId)
                        {
                            return ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(cityId);
                        },

                        RepairAll: function (ncity, visMode)
                        {
                            var oldMode = ClientLib.Vis.VisMain.GetInstance().get_Mode();
                            ClientLib.Vis.VisMain.GetInstance().set_Mode(visMode);
                            ncity.RepairAll();
                            ClientLib.Vis.VisMain.GetInstance().set_Mode(oldMode);
                        },

                        CanRepairAll: function (ncity, viewMode)
                        {
                            try
                            {
                                var repairData = ncity.get_CityRepairData();
                                var myRepair = repairData.CanRepair(0, viewMode);
                                repairData.UpdateCachedFullRepairAllCost(viewMode);
                                return ((myRepair != null) && (!ncity.get_IsLocked() || (viewMode != ClientLib.Vis.Mode.ArmySetup)));

                                return false;
                            } catch (e)
                            {
                                console.log("MaelstromTools.Wrapper.CanRepairAll: ", e);
                                return false;
                            }
                        },
                        GetDefenseUnits: function (cityUnits)
                        {
                            if (PerforceChangelist >= 392583)
                            {
                                //endgame patch
                                return (cityUnits.get_DefenseUnits() != null ? cityUnits.get_DefenseUnits().d : null);
                            } else
                            {
                                //old
                                var defenseObjects = [];
                                for (var x = 0; x < 9; x++)
                                {
                                    for (var y = 0; y < 8; y++)
                                    {
                                        var defenseObject = ClientLib.Vis.VisMain.GetInstance().get_DefenseSetup().GetDefenseObjectFromPosition((x * ClientLib.Vis.VisMain.GetInstance().get_City().get_GridWidth()), (y * ClientLib.Vis.VisMain.GetInstance().get_City().get_GridHeight()));
                                        if (defenseObject !== null && defenseObject.get_CityEntity() !== null)
                                        {
                                            defenseObjects.push(defenseObject.get_UnitDetails());
                                        }
                                    }
                                }
                                return defenseObjects;
                            }
                        },
                        GetUnitLevelRequirements: function (cityEntity)
                        {
                            if (PerforceChangelist >= 376877)
                            {
                                //new
                                return (cityEntity.get_UnitLevelRepairRequirements() != null ? cityEntity.get_UnitLevelRepairRequirements() : null);
                            } else
                            {
                                //old
                                return (cityEntity.get_UnitLevelRequirements() != null ? cityEntity.get_UnitLevelRequirements() : null);
                            }
                        },

                        GetBaseLevel: function (ncity)
                        {
                            return (Math.floor(ncity.get_LvlBase() * 100) / 100).toFixed(2);
                        }
                    }
                });

                // define LocalStorage
                qx.Class.define("MaelstromTools.LocalStorage", {
                    type: "static",
                    statics: {
                        isSupported: function ()
                        {
                            return typeof (Storage) !== "undefined";
                        },
                        set: function (key, value)
                        {
                            try
                            {
                                if (MaelstromTools.LocalStorage.isSupported())
                                {
                                    localStorage["CCTA_MaelstromTools_" + key] = JSON.stringify(value);
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.LocalStorage.set: ", e);
                            }
                        },
                        get: function (key, defaultValueIfNotSet)
                        {
                            try
                            {
                                if (MaelstromTools.LocalStorage.isSupported())
                                {
                                    if (localStorage["CCTA_MaelstromTools_" + key] != null && localStorage["CCTA_MaelstromTools_" + key] != 'undefined')
                                    {
                                        return JSON.parse(localStorage["CCTA_MaelstromTools_" + key]);
                                    }
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.LocalStorage.get: ", e);
                            }
                            return defaultValueIfNotSet;
                        },
                        clearAll: function ()
                        {
                            try
                            {
                                if (!MaelstromTools.LocalStorage.isSupported())
                                {
                                    return;
                                }
                                for (var key in localStorage)
                                {
                                    if (key.indexOf("CCTA_MaelstromTools_") == 0)
                                    {
                                        localStorage.removeItem(key);
                                    }
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.LocalStorage.clearAll: ", e);
                            }
                        }
                    }
                });

                // define Cache
                qx.Class.define("MaelstromTools.Cache", {
                    type: "singleton",
                    extend: qx.core.Object,
                    members: {
                        CityCount: 0,
                        Cities: null,
                        SelectedBaseForMenu: null,
                        SelectedBaseResources: null,
                        SelectedBaseForLoot: null,

                        updateCityCache: function ()
                        {
                            try
                            {
                                this.CityCount = 0;
                                this.Cities = Object();

                                var cities = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities();
                                for (var cindex in cities.d)
                                {
                                    this.CityCount++;
                                    var ncity = MaelstromTools.Wrapper.GetCity(cindex);
                                    var ncityName = ncity.get_Name();
                                    this.Cities[ncityName] = Object();
                                    this.Cities[ncityName]["ID"] = cindex;
                                    this.Cities[ncityName]["Object"] = ncity;
                                }
                            } catch (e)
                            {
                                console.log("MaelstromTools.Cache.updateCityCache: ", e);
                            }
                        },

                        updateLoot: function (visCity)
                        {
                            var cityId = visCity.get_Id();

                            if (this.SelectedBaseForLoot != null && cityId == this.SelectedBaseForLoot.get_Id() && this.SelectedBaseResources != null && this.SelectedBaseResources["LoadState"] > 0)
                            {
                                return -2;
                            }
                            this.SelectedBaseForLoot = visCity;
                            this.SelectedBaseResources = MaelstromTools.Util.getResources(visCity);
                            return this.SelectedBaseResources["LoadState"];
                        }
                    }
                });

                // define HuffyTools.ImageRender
                qx.Class.define("HuffyTools.ImageRender", {
                    extend: qx.ui.table.cellrenderer.AbstractImage,
                    construct: function (width, height)
                    {
                        this.base(arguments);
                        if (width)
                        {
                            this.__imageWidth = width;
                        }
                        if (height)
                        {
                            this.__imageHeight = height;
                        }
                        this.__am = qx.util.AliasManager.getInstance();
                    },
                    members: {
                        __am: null,
                        __imageHeight: 16,
                        __imageWidth: 16,
                        // overridden
                        _identifyImage: function (cellInfo)
                        {
                            var imageHints = {
                                imageWidth: this.__imageWidth,
                                imageHeight: this.__imageHeight
                            };
                            if (cellInfo.value == "")
                            {
                                imageHints.url = null;
                            } else
                            {
                                imageHints.url = this.__am.resolve(cellInfo.value);
                            }
                            imageHints.tooltip = cellInfo.tooltip;
                            return imageHints;
                        }
                    },
                    destruct: function ()
                    {
                        this.__am = null;
                    }
                });

                // define HuffyTools.ReplaceRender
                qx.Class.define("HuffyTools.ReplaceRender", {
                    extend: qx.ui.table.cellrenderer.Default,
                    properties: {
                        replaceFunction: {
                            check: "Function",
                            nullable: true,
                            init: null
                        }
                    },
                    members: {
                        // overridden
                        _getContentHtml: function (cellInfo)
                        {
                            var value = cellInfo.value;
                            var replaceFunc = this.getReplaceFunction();
                            // use function
                            if (replaceFunc)
                            {
                                cellInfo.value = replaceFunc(value);
                            }
                            return qx.bom.String.escape(this._formatValue(cellInfo));
                        }
                    }
                });

                qx.Class.define("HuffyTools.CityCheckBox", {
                    extend: qx.ui.form.CheckBox,
                    members: {
                        HT_CityID: null
                    }
                });

                // define HuffyTools.UpgradePriorityGUI
                qx.Class.define("HuffyTools.UpgradePriorityGUI", {
                    type: "singleton",
                    extend: MaelstromTools.DefaultObject,
                    members: {
                        HT_TabView: null,
                        HT_Options: null,
                        HT_ShowOnlyTopBuildings: null,
                        HT_ShowOnlyAffordableBuildings: null,
                        HT_CityBuildings: null,
                        HT_Pages: null,
                        HT_Tables: null,
                        HT_Models: null,
                        HT_SelectedResourceType: null,
                        BuildingList: null,
                        upgradeInProgress: null,
                        init: function ()
                        {
                            try
                            {
                                this.HT_SelectedResourceType = -1;
                                this.IsTimerEnabled = false;
                                this.upgradeInProgress = false;

                                this.HT_TabView = new qx.ui.tabview.TabView();
                                this.HT_TabView.set({
                                    contentPadding: 0,
                                    appearance: "tabview",
                                    margin: 5,
                                    barPosition: 'left'
                                });
                                this.Widget = new qx.ui.tabview.Page("UpgradePriority");
                                this.Widget.setPadding(0);
                                this.Widget.setMargin(0);
                                this.Widget.setBackgroundColor("#BEC8CF");
                                this.Widget.setLayout(new qx.ui.layout.VBox(2));
                                this.Widget.add(this.HT_TabView, {
                                    flex: 1
                                });
                                this.Window.setPadding(0);
                                this.Window.set({
                                    resizable: true
                                });

                                this.Window.removeAll();
                                this.Window.add(this.Widget);

                                this.BuildingList = new Array;
                                this.HT_Models = new Array;
                                this.HT_Tables = new Array;
                                this.HT_Pages = new Array;

                                this.createTabPage(ClientLib.Base.EResourceType.Tiberium);
                                this.createTable(ClientLib.Base.EResourceType.Tiberium);
                                this.HT_Tables[ClientLib.Base.EResourceType.Tiberium].addListener("cellClick", function (e)
                                {
                                    this.upgradeBuilding(e, ClientLib.Base.EResourceType.Tiberium);
                                }, this);


                                this.createTabPage(ClientLib.Base.EResourceType.Crystal);
                                this.createTable(ClientLib.Base.EResourceType.Crystal);
                                this.HT_Tables[ClientLib.Base.EResourceType.Crystal].addListener("cellClick", function (e)
                                {
                                    this.upgradeBuilding(e, ClientLib.Base.EResourceType.Crystal);
                                }, this);

                                this.createTabPage(ClientLib.Base.EResourceType.Power);
                                this.createTable(ClientLib.Base.EResourceType.Power);
                                this.HT_Tables[ClientLib.Base.EResourceType.Power].addListener("cellClick", function (e)
                                {
                                    this.upgradeBuilding(e, ClientLib.Base.EResourceType.Power);
                                }, this);

                                this.createTabPage(ClientLib.Base.EResourceType.Gold);
                                this.createTable(ClientLib.Base.EResourceType.Gold);
                                this.HT_Tables[ClientLib.Base.EResourceType.Gold].addListener("cellClick", function (e)
                                {
                                    this.upgradeBuilding(e, ClientLib.Base.EResourceType.Gold);
                                }, this);


                                MT_Cache.updateCityCache();
                                this.HT_Options = new Array();
                                this.HT_ShowOnlyTopBuildings = new Array();
                                this.HT_ShowOnlyAffordableBuildings = new Array();
                                this.HT_CityBuildings = new Array();
                                for (var mPage in this.HT_Pages)
                                {
                                    this.createOptions(mPage);
                                    this.HT_Pages[mPage].add(this.HT_Options[mPage]);
                                    this.HT_Pages[mPage].add(this.HT_Tables[mPage], {
                                        flex: 1
                                    });
                                    this.HT_TabView.add(this.HT_Pages[mPage]);
                                }

                                // Zeigen wir Dollars an !
                                this.HT_TabView.setSelection([this.HT_TabView.getChildren()[2]]);
                                this.HT_SelectedResourceType = ClientLib.Base.EResourceType.Gold;
                            } catch (e)
                            {
                                console.log("HuffyTools.UpgradePriority.init: ", e);
                            }
                        },
                        createOptions: function (eType)
                        {
                            var oBox = new qx.ui.layout.Flow();
                            var oOptions = new qx.ui.container.Composite(oBox);
                            oOptions.setMargin(5);
                            this.HT_ShowOnlyTopBuildings[eType] = new qx.ui.form.CheckBox(Lang.gt("display only top buildings"));
                            this.HT_ShowOnlyTopBuildings[eType].setMargin(5);
                            this.HT_ShowOnlyTopBuildings[eType].setValue(MaelstromTools.LocalStorage.get("UGL_TOPBUILDINGS_" + eType, true));
                            this.HT_ShowOnlyTopBuildings[eType].addListener("execute", this.CBChanged, this);
                            oOptions.add(this.HT_ShowOnlyTopBuildings[eType], {
                                left: 10,
                                top: 10
                            });
                            this.HT_ShowOnlyAffordableBuildings[eType] = new qx.ui.form.CheckBox(Lang.gt("display only affordable buildings"));
                            this.HT_ShowOnlyAffordableBuildings[eType].setMargin(5);
                            this.HT_ShowOnlyAffordableBuildings[eType].setValue(MaelstromTools.LocalStorage.get("UGL_AFFORDABLE_" + eType, true));
                            this.HT_ShowOnlyAffordableBuildings[eType].addListener("execute", this.CBChanged, this);
                            oOptions.add(this.HT_ShowOnlyAffordableBuildings[eType], {
                                left: 10,
                                top: 10,
                                lineBreak: true
                            });
                            this.HT_CityBuildings[eType] = new Array();
                            for (var cname in MT_Cache.Cities)
                            {
                                var oCity = MT_Cache.Cities[cname].Object;
                                var oCityBuildings = new HuffyTools.CityCheckBox(cname);
                                oCityBuildings.HT_CityID = oCity.get_Id();
                                oCityBuildings.setMargin(5);
                                oCityBuildings.setValue(MaelstromTools.LocalStorage.get("UGL_CITYFILTER_" + eType + "_" + oCity.get_Id(), true));
                                oCityBuildings.addListener("execute", this.CBChanged, this);
                                oOptions.add(oCityBuildings, {
                                    left: 10,
                                    top: 10
                                });
                                this.HT_CityBuildings[eType][cname] = oCityBuildings;
                            }
                            this.HT_Options[eType] = oOptions;
                        },
                        createTable: function (eType)
                        {
                            try
                            {
                                this.HT_Models[eType] = new qx.ui.table.model.Simple();
                                this.HT_Models[eType].setColumns(["ID", Lang.gt("City"), Lang.gt("Type (coord)"), Lang.gt("to Level"), Lang.gt("Gain/h"), Lang.gt("Factor"), Lang.gt("Tiberium"), Lang.gt("Power"), Lang.gt("Tib/gain"), Lang.gt("Pow/gain"), Lang.gt("ETA"), Lang.gt("Upgrade"), "State"]);
                                this.HT_Tables[eType] = new qx.ui.table.Table(this.HT_Models[eType]);
                                this.HT_Tables[eType].setColumnVisibilityButtonVisible(false);
                                this.HT_Tables[eType].setColumnWidth(0, 0);
                                this.HT_Tables[eType].setColumnWidth(1, 90);
                                this.HT_Tables[eType].setColumnWidth(2, 120);
                                this.HT_Tables[eType].setColumnWidth(3, 55);
                                this.HT_Tables[eType].setColumnWidth(4, 70);
                                this.HT_Tables[eType].setColumnWidth(5, 60);
                                this.HT_Tables[eType].setColumnWidth(6, 70);
                                this.HT_Tables[eType].setColumnWidth(7, 70);
                                this.HT_Tables[eType].setColumnWidth(8, 70);
                                this.HT_Tables[eType].setColumnWidth(9, 70);
                                this.HT_Tables[eType].setColumnWidth(10, 70);
                                this.HT_Tables[eType].setColumnWidth(11, 40);
                                this.HT_Tables[eType].setColumnWidth(12, 0);
                                var tcm = this.HT_Tables[eType].getTableColumnModel();
                                tcm.setColumnVisible(0, false);
                                tcm.setColumnVisible(12, false);
                                tcm.setDataCellRenderer(4, new qx.ui.table.cellrenderer.Number().set({
                                    numberFormat: new qx.util.format.NumberFormat().set({
                                        maximumFractionDigits: 2,
                                        minimumFractionDigits: 2
                                    })
                                }));
                                tcm.setDataCellRenderer(5, new qx.ui.table.cellrenderer.Number().set({
                                    numberFormat: new qx.util.format.NumberFormat().set({
                                        maximumFractionDigits: 5,
                                        minimumFractionDigits: 5
                                    })
                                }));
                                tcm.setDataCellRenderer(6, new HuffyTools.ReplaceRender().set({
                                    ReplaceFunction: this.formatTiberiumAndPower
                                }));
                                tcm.setDataCellRenderer(7, new HuffyTools.ReplaceRender().set({
                                    ReplaceFunction: this.formatTiberiumAndPower
                                }));
                                tcm.setDataCellRenderer(11, new HuffyTools.ImageRender(40, 20));
                            } catch (e)
                            {
                                console.log("HuffyTools.UpgradePriority.createTable: ", e);
                            }
                        },
                        createTabPage: function (resource_type)
                        {
                            try
                            {
                                var sName = MaelstromTools.Statics.LootTypeName(resource_type);
                                var oRes = new qx.ui.tabview.Page(Lang.gt(sName), MT_Base.images[sName]);
                                oRes.setLayout(new qx.ui.layout.VBox(2));
                                oRes.setPadding(5);
                                var btnTab = oRes.getChildControl("button");
                                btnTab.resetWidth();
                                btnTab.resetHeight();
                                btnTab.set({
                                    show: "icon",
                                    margin: 0,
                                    padding: 0,
                                    toolTipText: sName
                                });
                                btnTab.addListener("execute", this.TabChanged, [this, resource_type]);
                                this.HT_Pages[resource_type] = oRes;
                                return oRes;
                            } catch (e)
                            {
                                console.log("HuffyTools.UpgradePriority.createTabPage: ", e);
                            }
                        },

                        TabChanged: function (e)
                        {
                            try
                            {
                                this[0].HT_SelectedResourceType = this[1];
                                this[0].UpgradeCompleted(null, null);
                            } catch (e)
                            {
                                console.log("HuffyTools.UpgradePriority.TabChanged: ", e);
                            }
                        },

                        upgradeBuilding: function (e, eResourceType)
                        {
                            if (this.upgradeInProgress == true)
                            {
                                console.log("upgradeBuilding:", "upgrade in progress !");
                                return;
                            }
                            try
                            {
                                if (e.getColumn() == 11)
                                {
                                    var buildingID = this.HT_Models[eResourceType].getValue(0, e.getRow());
                                    var iState = parseInt(this.HT_Models[eResourceType].getValue(12, e.getRow()));
                                    if (iState != 1)
                                    {
                                        return;
                                    }
                                    if (buildingID in this.BuildingList)
                                    {
                                        this.upgradeInProgress = true;
                                        if (PerforceChangelist >= 382917)
                                        {
                                            //new
                                            ClientLib.Net.CommunicationManager.GetInstance().SendCommand("UpgradeBuilding", this.BuildingList[buildingID], phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, this.UpgradeCompleted), null, true);
                                        } else
                                        {
                                            //old
                                            ClientLib.Net.CommunicationManager.GetInstance().SendCommand("UpgradeBuilding", this.BuildingList[buildingID], webfrontend.Util.createEventDelegate(ClientLib.Net.CommandResult, this, this.UpgradeCompleted), null, true);
                                        }
                                    }
                                }
                            } catch (e)
                            {
                                console.log("HuffyTools.UpgradePriority.upgradeBuilding: ", e);
                            }
                        },
                        UpgradeCompleted: function (context, result)
                        {
                            var self = this;
                            window.setTimeout(function ()
                            {
                                self.calc();
                            }, 1000);
                            this.upgradeInProgress = false;
                        },
                        CBChanged: function (e)
                        {
                            this.UpgradeCompleted(null, null);
                        },
                        formatTiberiumAndPower: function (oValue)
                        {
                            if (PerforceChangelist >= 387751)
                            {
                                //new
                                return phe.cnc.gui.util.Numbers.formatNumbersCompact(oValue);
                            } else
                            {
                                //old
                                return webfrontend.gui.Util.formatNumbersCompact(oValue);
                            }
                        },
                        updateCache: function ()
                        {
                            try
                            {
                                if (!this.HT_TabView)
                                {
                                    this.init();
                                }
                                var eType = this.HT_SelectedResourceType;
                                var bTop = this.HT_ShowOnlyTopBuildings[eType].getValue();
                                MaelstromTools.LocalStorage.set("UGL_TOPBUILDINGS_" + eType, bTop);

                                var bAffordable = this.HT_ShowOnlyAffordableBuildings[eType].getValue();
                                MaelstromTools.LocalStorage.set("UGL_AFFORDABLE_" + eType, bAffordable);

                                var oCityFilter = new Array();
                                for (var cname in this.HT_CityBuildings[eType])
                                {
                                    var oCityBuildings = this.HT_CityBuildings[eType][cname];
                                    var bFilterBuilding = oCityBuildings.getValue();
                                    MaelstromTools.LocalStorage.set("UGL_CITYFILTER_" + eType + "_" + oCityBuildings.HT_CityID, bFilterBuilding);
                                    oCityFilter[cname] = bFilterBuilding;
                                }

                                window.HuffyTools.UpgradePriority.getInstance().collectData(bTop, bAffordable, oCityFilter, eType);
                            } catch (e)
                            {
                                console.log("HuffyTools.UpgradePriority.updateCache: ", e);
                            }
                        },
                        setWidgetLabels: function ()
                        {
                            try
                            {
                                var HuffyCalc = window.HuffyTools.UpgradePriority.getInstance();
                                var UpgradeList = HuffyCalc.Cache;

                                for (var eResourceType in UpgradeList)
                                {
                                    var rowData = [];

                                    this.HT_Models[eResourceType].setData([]);

                                    for (var mCity in UpgradeList[eResourceType])
                                    {
                                        for (var mBuilding in UpgradeList[eResourceType][mCity])
                                        {
                                            var UpItem = UpgradeList[eResourceType][mCity][mBuilding];
                                            if (typeof (UpItem.Type) == "undefined")
                                            {
                                                continue;
                                            }
                                            if (!(mBuilding in this.BuildingList))
                                            {
                                                this.BuildingList[UpItem.ID] = UpItem.Building;
                                            }
                                            var iTiberiumCosts = 0;
                                            if (ClientLib.Base.EResourceType.Tiberium in UpItem.Costs)
                                            {
                                                iTiberiumCosts = UpItem.Costs[ClientLib.Base.EResourceType.Tiberium];
                                            }
                                            var iTiberiumPerGain = 0;
                                            if (ClientLib.Base.EResourceType.Tiberium in UpItem.Costs)
                                            {
                                                iTiberiumPerGain = UpItem.Costs[ClientLib.Base.EResourceType.Tiberium] / UpItem.GainPerHour;
                                            }
                                            var iPowerCosts = 0;
                                            if (ClientLib.Base.EResourceType.Power in UpItem.Costs)
                                            {
                                                iPowerCosts = UpItem.Costs[ClientLib.Base.EResourceType.Power];
                                            }
                                            var iPowerPerGain = 0;
                                            if (ClientLib.Base.EResourceType.Power in UpItem.Costs)
                                            {
                                                iPowerPerGain = UpItem.Costs[ClientLib.Base.EResourceType.Power] / UpItem.GainPerHour;
                                            }
                                            var img = MT_Base.images["UpgradeBuilding"];
                                            if (UpItem.Affordable == false)
                                            {
                                                img = "";
                                            }
                                            var sType = UpItem.Type;
                                            sType = sType + "(" + UpItem.PosX + ":" + UpItem.PosY + ")";
                                            var iETA = 0;
                                            if (UpItem.TimeTillUpgradable[ClientLib.Base.EResourceType.Tiberium] > 0)
                                            {
                                                iETA = UpItem.TimeTillUpgradable[ClientLib.Base.EResourceType.Tiberium];
                                            }
                                            if (UpItem.TimeTillUpgradable[ClientLib.Base.EResourceType.Power] > iETA)
                                            {
                                                iETA = UpItem.TimeTillUpgradable[ClientLib.Base.EResourceType.Power];
                                            }
                                            var sETA = "";
                                            if (iETA > 0)
                                            {
                                                sETA = ClientLib.Vis.VisMain.FormatTimespan(iETA);
                                            }
                                            var iState = 0;
                                            if (UpItem.Affordable == true)
                                            {
                                                iState = 1;
                                            } else if (UpItem.AffordableByTransfer == true)
                                            {
                                                iState = 2;
                                            } else
                                            {
                                                iState = 3;
                                            }
                                            rowData.push([UpItem.ID, mCity, sType, UpItem.Level, UpItem.GainPerHour, UpItem.Ticks, iTiberiumCosts, iPowerCosts, iTiberiumPerGain, iPowerPerGain, sETA, img, iState]);
                                        }
                                    }
                                    this.HT_Models[eResourceType].setData(rowData);
                                }
                            } catch (e)
                            {
                                console.log("HuffyTools.UpgradePriority.setWidgetLabels: ", e);
                            }
                        }
                    }
                });

                // define HuffyTools.UpgradePriority
                qx.Class.define("HuffyTools.UpgradePriority", {
                    type: "singleton",
                    extend: qx.core.Object,
                    members: {
                        list_units: null,
                        list_buildings: null,

                        comparePrio: function (elem1, elem2)
                        {
                            if (elem1.Ticks < elem2.Ticks) return -1;
                            if (elem1.Ticks > elem2.Ticks) return 1;
                            return 0;
                        },
                        getPrioList: function (city, arTechtypes, eModPackageSize, eModProduction, bOnlyTopBuildings, bOnlyAffordableBuildings)
                        {
                            try
                            {
                                var RSI = window.MaelstromTools.ResourceOverview.getInstance();
                                RSI.updateCache();
                                var TotalTiberium = 0;

                                for (var cityName in this.Cache)
                                {
                                    var cityCache = this.Cache[cityName];
                                    var i = cityCache[MaelstromTools.Statics.Tiberium];
                                    if (typeof (i) !== 'undefined')
                                    {
                                        TotalTiberium += i;
                                        //but never goes here during test.... // to optimize - to do
                                    }
                                }
                                var resAll = new Array();
                                var prod = MaelstromTools.Production.getInstance().updateCache(city.get_Name());
                                var buildings = city.get_Buildings().d;

                                // 376877 & old fixes 
                                var objbuildings = [];
                                if (PerforceChangelist >= 376877)
                                { //new
                                    for (var o in buildings) objbuildings.push(buildings[o]);
                                } else
                                { //old
                                    for (var i = 0; i < buildings.length; i++) objbuildings.push(buildings[i]);
                                }


                                for (var i = 0; i < objbuildings.length; i++)
                                {
                                    var city_building = objbuildings[i];

                                    // TODO: check for destroyed building

                                    var iTechType = city_building.get_TechName();
                                    var bSkip = true;
                                    for (var iTypeKey in arTechtypes)
                                    {
                                        if (arTechtypes[iTypeKey] == iTechType)
                                        {
                                            bSkip = false;
                                            break;
                                        }
                                    }
                                    if (bSkip == true)
                                    {
                                        continue;
                                    }
                                    var city_buildingdetailview = city.GetBuildingDetailViewInfo(city_building);
                                    if (city_buildingdetailview == null)
                                    {
                                        continue;
                                    }
                                    var bindex = city_building.get_Id();
                                    var resbuilding = new Array();
                                    resbuilding["ID"] = bindex;
                                    resbuilding["Type"] = this.TechTypeName(parseInt(iTechType, 10));
                                    resbuilding["PosX"] = city_building.get_CoordX();
                                    resbuilding["PosY"] = city_building.get_CoordY();

                                    resbuilding["Building"] = {
                                        cityid: city.get_Id(),
                                        posX: resbuilding["PosX"],
                                        posY: resbuilding["PosY"],
                                        isPaid: true
                                    };

                                    resbuilding["GainPerHour"] = 0;
                                    resbuilding["Level"] = city_building.get_CurrentLevel() + 1;
                                    for (var ModifierType in city_buildingdetailview.OwnProdModifiers.d)
                                    {
                                        switch (parseInt(ModifierType, 10))
                                        {
                                            case eModPackageSize:
                                                {
                                                    var ModOj = city_buildingdetailview.OwnProdModifiers.d[city_building.get_MainModifierTypeId()];
                                                    var Mod = (ModOj.TotalValue + ModOj.NewLvlDelta) / ClientLib.Data.MainData.GetInstance().get_Time().get_StepsPerHour();
                                                    resbuilding["GainPerHour"] += (city_buildingdetailview.OwnProdModifiers.d[ModifierType].NewLvlDelta / Mod);
                                                    break;
                                                }
                                            case eModProduction:
                                                {
                                                    resbuilding["GainPerHour"] += city_buildingdetailview.OwnProdModifiers.d[ModifierType].NewLvlDelta;
                                                    break;
                                                }
                                        }
                                    }

                                    var TechLevelData = ClientLib.Base.Util.GetTechLevelResourceRequirements_Obj(city_building.get_CurrentLevel() + 1, city_building.get_TechGameData_Obj());
                                    var RatioPerCostType = new Object();
                                    var sRatio = "";
                                    var sCosts = "";
                                    var lTicks = 0;
                                    var bHasPower = true;
                                    var bHasTiberium = true;
                                    var bAffordableByTransfer = true;
                                    var oCosts = new Array();
                                    var oTimes = new Array();
                                    for (var costtype in TechLevelData)
                                    {
                                        if (typeof (TechLevelData[costtype]) == "function")
                                        {
                                            continue;
                                        }
                                        if (TechLevelData[costtype].Type == "0")
                                        {
                                            continue;
                                        }

                                        oCosts[TechLevelData[costtype].Type] = TechLevelData[costtype].Count;
                                        if (parseInt(TechLevelData[costtype].Count) <= 0)
                                        {
                                            continue;
                                        }
                                        RatioPerCostType[costtype] = TechLevelData[costtype].Count / resbuilding["GainPerHour"];
                                        if (sCosts.length > 0)
                                        {
                                            sCosts = sCosts + ", ";
                                        }
                                        sCosts = sCosts + MaelstromTools.Wrapper.FormatNumbersCompact(TechLevelData[costtype].Count) + " " + MaelstromTools.Statics.LootTypeName(TechLevelData[costtype].Type);
                                        if (sRatio.length > 0)
                                        {
                                            sRatio = sRatio + ", ";
                                        }

                                        // Upgrade affordable ?
                                        if (city.GetResourceCount(TechLevelData[costtype].Type) < TechLevelData[costtype].Count)
                                        {
                                            switch (TechLevelData[costtype].Type)
                                            {
                                                case ClientLib.Base.EResourceType.Tiberium:
                                                    {
                                                        bHasTiberium = false;
                                                        if (TotalTiberium < TechLevelData[costtype].Count)
                                                        {
                                                            bAffordableByTransfer = false;
                                                        }
                                                    }
                                                    break;
                                                case ClientLib.Base.EResourceType.Power:
                                                    {
                                                        bHasPower = false;
                                                    }
                                                    break;
                                            }
                                        }
                                        sRatio = sRatio + MaelstromTools.Wrapper.FormatNumbersCompact(RatioPerCostType[costtype]);

                                        var techlevelData = MaelstromTools.Statics.LootTypeName(TechLevelData[costtype].Type);

                                        var dCityProduction = prod[techlevelData].Delta + prod[techlevelData].ExtraBonusDelta + prod[techlevelData].POI;
                                        if (dCityProduction > 0)
                                        {
                                            if (lTicks < (3600 * RatioPerCostType[costtype] / dCityProduction))
                                            {
                                                lTicks = (3600 * RatioPerCostType[costtype] / dCityProduction);
                                            }
                                        }
                                        oTimes[TechLevelData[costtype].Type] = 0;
                                        if (oCosts[TechLevelData[costtype].Type] > city.GetResourceCount(TechLevelData[costtype].Type))
                                        {
                                            oTimes[TechLevelData[costtype].Type] = (3600 * (oCosts[TechLevelData[costtype].Type] - city.GetResourceCount(TechLevelData[costtype].Type))) / dCityProduction;
                                        }
                                    }
                                    resbuilding["Ticks"] = lTicks;
                                    resbuilding["Time"] = ClientLib.Vis.VisMain.FormatTimespan(lTicks);
                                    resbuilding["Costtext"] = sCosts;
                                    resbuilding["Costs"] = oCosts;
                                    resbuilding["TimeTillUpgradable"] = oTimes;
                                    resbuilding["Ratio"] = sRatio;
                                    resbuilding["Affordable"] = bHasTiberium && bHasPower;
                                    resbuilding["AffordableByTransfer"] = bHasPower && bAffordableByTransfer;
                                    if (resbuilding["GainPerHour"] > 0 && (bOnlyAffordableBuildings == false || resbuilding["Affordable"] == true))
                                    {
                                        resAll[bindex] = resbuilding;
                                    }
                                }

                                resAll = resAll.sort(this.comparePrio);
                                if (!bOnlyTopBuildings)
                                {
                                    return resAll;
                                }
                                var res2 = new Array();
                                if (MaelstromTools.Util.ArraySize(resAll) > 0)
                                {
                                    var iTopNotAffordable = -1;
                                    var iTopAffordable = -1;
                                    var iNextNotAffordable = -1;
                                    var iLastIndex = -1;
                                    for (var iNewIndex in resAll)
                                    {
                                        if (resAll[iNewIndex].Affordable == true)
                                        {
                                            if (iTopAffordable == -1)
                                            {
                                                iTopAffordable = iNewIndex;
                                                iNextNotAffordable = iLastIndex;
                                            }
                                        } else
                                        {
                                            if (iTopNotAffordable == -1)
                                            {
                                                iTopNotAffordable = iNewIndex;
                                            }
                                        }
                                        iLastIndex = iNewIndex;
                                    }
                                    if (iTopAffordable == -1)
                                    {
                                        iNextNotAffordable = iLastIndex;
                                    }
                                    var iIndex = 0;
                                    if (iTopNotAffordable != -1)
                                    {
                                        res2[iIndex++] = resAll[iTopNotAffordable];
                                    }
                                    if (iNextNotAffordable != -1)
                                    {
                                        res2[iIndex++] = resAll[iNextNotAffordable];
                                    }
                                    if (iTopAffordable != -1)
                                    {
                                        res2[iIndex++] = resAll[iTopAffordable];
                                    }
                                }
                                res2 = res2.sort(this.comparePrio);
                                return res2;
                            } catch (e)
                            {
                                console.log("HuffyTools.getPrioList: ", e);
                            }
                        },
                        TechTypeName: function (iTechType)
                        {
                            switch (iTechType)
                            {
                                case ClientLib.Base.ETechName.PowerPlant:
                                    {
                                        return Lang.gt("Powerplant");
                                        break;
                                    }
                                case ClientLib.Base.ETechName.Refinery:
                                    {
                                        return Lang.gt("Refinery");
                                        break;
                                    }
                                case ClientLib.Base.ETechName.Harvester_Crystal:
                                    {
                                        return Lang.gt("Harvester");
                                        break;
                                    }
                                case ClientLib.Base.ETechName.Harvester:
                                    {
                                        return Lang.gt("Harvester");
                                        break;
                                    }
                                case ClientLib.Base.ETechName.Silo:
                                    {
                                        return Lang.gt("Silo");
                                        break;
                                    }
                                case ClientLib.Base.ETechName.Accumulator:
                                    {
                                        return Lang.gt("Accumulator");
                                        break;
                                    }
                            }
                            return "?";
                        },
                        collectData: function (bOnlyTopBuildings, bOnlyAffordableBuildings, oCityFilter, eSelectedResourceType)
                        {
                            try
                            {
                                MT_Cache.updateCityCache();
                                this.Cache = new Object();
                                if (eSelectedResourceType == ClientLib.Base.EResourceType.Tiberium)
                                {
                                    this.Cache[ClientLib.Base.EResourceType.Tiberium] = new Object();
                                }
                                if (eSelectedResourceType == ClientLib.Base.EResourceType.Crystal)
                                {
                                    this.Cache[ClientLib.Base.EResourceType.Crystal] = new Object();
                                }
                                if (eSelectedResourceType == ClientLib.Base.EResourceType.Power)
                                {
                                    this.Cache[ClientLib.Base.EResourceType.Power] = new Object();
                                }
                                if (eSelectedResourceType == ClientLib.Base.EResourceType.Gold)
                                {
                                    this.Cache[ClientLib.Base.EResourceType.Gold] = new Object();
                                }
                                for (var cname in MT_Cache.Cities)
                                {
                                    var city = MT_Cache.Cities[cname].Object;
                                    if (oCityFilter[cname] == false)
                                    {
                                        continue;
                                    }
                                    if (eSelectedResourceType == ClientLib.Base.EResourceType.Tiberium)
                                    {
                                        this.Cache[ClientLib.Base.EResourceType.Tiberium][cname] = this.getPrioList(city, [ClientLib.Base.ETechName.Harvester, ClientLib.Base.ETechName.Silo], ClientLib.Base.EModifierType.TiberiumPackageSize, ClientLib.Base.EModifierType.TiberiumProduction, bOnlyTopBuildings, bOnlyAffordableBuildings);
                                    }
                                    if (eSelectedResourceType == ClientLib.Base.EResourceType.Crystal)
                                    {
                                        this.Cache[ClientLib.Base.EResourceType.Crystal][cname] = this.getPrioList(city, [ClientLib.Base.ETechName.Harvester, ClientLib.Base.ETechName.Silo], ClientLib.Base.EModifierType.CrystalPackageSize, ClientLib.Base.EModifierType.CrystalProduction, bOnlyTopBuildings, bOnlyAffordableBuildings);
                                    }
                                    if (eSelectedResourceType == ClientLib.Base.EResourceType.Power)
                                    {
                                        this.Cache[ClientLib.Base.EResourceType.Power][cname] = this.getPrioList(city, [ClientLib.Base.ETechName.PowerPlant, ClientLib.Base.ETechName.Accumulator], ClientLib.Base.EModifierType.PowerPackageSize, ClientLib.Base.EModifierType.PowerProduction, bOnlyTopBuildings, bOnlyAffordableBuildings);
                                    }
                                    if (eSelectedResourceType == ClientLib.Base.EResourceType.Gold)
                                    {
                                        this.Cache[ClientLib.Base.EResourceType.Gold][cname] = this.getPrioList(city, [ClientLib.Base.ETechName.Refinery, ClientLib.Base.ETechName.PowerPlant], ClientLib.Base.EModifierType.CreditsPackageSize, ClientLib.Base.EModifierType.CreditsProduction, bOnlyTopBuildings, bOnlyAffordableBuildings);
                                    }
                                }
                            } catch (e)
                            {
                                console.log("HuffyTools.UpgradePriority.collectData: ", e);
                            }
                        }
                    }
                });

                var __MTCity_initialized = false; //k undeclared

                var Lang = window.MaelstromTools.Language.getInstance();
                var MT_Cache = window.MaelstromTools.Cache.getInstance();
                var MT_Base = window.MaelstromTools.Base.getInstance();
                var MT_Preferences = window.MaelstromTools.Preferences.getInstance();
                MT_Preferences.readOptions();

                if (!webfrontend.gui.region.RegionCityMenu.prototype.__MTCity_showMenu)
                {
                    webfrontend.gui.region.RegionCityMenu.prototype.__MTCity_showMenu = webfrontend.gui.region.RegionCityMenu.prototype.showMenu;
                }
                webfrontend.gui.region.RegionCityMenu.prototype.showMenu = function (selectedVisObject)
                {

                    MT_Cache.SelectedBaseForMenu = selectedVisObject;
                    var baseStatusOverview = window.MaelstromTools.BaseStatus.getInstance();

                    if (__MTCity_initialized == false)
                    {
                        __MTCity_initialized = true;
                        baseStatusOverview.CityMenuButtons = new Array();

                        for (var k in this)
                        {
                            try
                            {
                                if (this.hasOwnProperty(k))
                                {
                                    if (this[k] && this[k].basename == "Composite")
                                    {
                                        var button = new qx.ui.form.Button(Lang.gt("Calibrate support"));
                                        button.addListener("execute", function (e)
                                        {
                                            MaelstromTools.Util.calibrateWholeSupportOnSelectedBase();
                                        }, this);

                                        this[k].add(button);
                                        baseStatusOverview.CityMenuButtons.push(button);
                                    }
                                }
                            } catch (e)
                            {
                                console.log("webfrontend.gui.region.RegionCityMenu.prototype.showMenu: ", e);
                            }
                        }
                    }

                    var isAllowed = MaelstromTools.Util.checkIfSupportIsAllowed(MT_Cache.SelectedBaseForMenu);

                    for (var x = 0; x < baseStatusOverview.CityMenuButtons.length; ++x)
                    {
                        baseStatusOverview.CityMenuButtons[x].setVisibility(isAllowed ? 'visible' : 'excluded');
                    }
                    this.__MTCity_showMenu(selectedVisObject);
                };

                if (MT_Preferences.Settings.showLoot)
                {
                    // Wrap onCitiesChange method
                    if (!webfrontend.gui.region.RegionNPCCampStatusInfo.prototype.__MTCity_NPCCamp)
                    {
                        webfrontend.gui.region.RegionNPCCampStatusInfo.prototype.__MTCity_NPCCamp = webfrontend.gui.region.RegionNPCCampStatusInfo.prototype.onCitiesChange;
                    }
                    webfrontend.gui.region.RegionNPCCampStatusInfo.prototype.onCitiesChange = function ()
                    {
                        MT_Base.updateLoot(1, ClientLib.Vis.VisMain.GetInstance().get_SelectedObject(), webfrontend.gui.region.RegionNPCCampStatusInfo.getInstance());
                        return this.__MTCity_NPCCamp();
                    };

                    if (!webfrontend.gui.region.RegionNPCBaseStatusInfo.prototype.__MTCity_NPCBase)
                    {
                        webfrontend.gui.region.RegionNPCBaseStatusInfo.prototype.__MTCity_NPCBase = webfrontend.gui.region.RegionNPCBaseStatusInfo.prototype.onCitiesChange;
                    }
                    webfrontend.gui.region.RegionNPCBaseStatusInfo.prototype.onCitiesChange = function ()
                    {
                        MT_Base.updateLoot(2, ClientLib.Vis.VisMain.GetInstance().get_SelectedObject(), webfrontend.gui.region.RegionNPCBaseStatusInfo.getInstance());
                        return this.__MTCity_NPCBase();
                    };

                    if (!webfrontend.gui.region.RegionCityStatusInfoEnemy.prototype.__MTCity_City)
                    {
                        webfrontend.gui.region.RegionCityStatusInfoEnemy.prototype.__MTCity_City = webfrontend.gui.region.RegionCityStatusInfoEnemy.prototype.onCitiesChange;
                    }
                    webfrontend.gui.region.RegionCityStatusInfoEnemy.prototype.onCitiesChange = function ()
                    {
                        MT_Base.updateLoot(3, ClientLib.Vis.VisMain.GetInstance().get_SelectedObject(), webfrontend.gui.region.RegionCityStatusInfoEnemy.getInstance());
                        return this.__MTCity_City();
                    };
                }

            }
        } catch (e)
        {
            console.log("createMaelstromTools: ", e);
        }

        function MaelstromTools_checkIfLoaded()
        {
            try
            {
                if (typeof qx != 'undefined' && qx.core.Init.getApplication() && qx.core.Init.getApplication().getUIItem(ClientLib.Data.Missions.PATH.BAR_NAVIGATION) && qx.core.Init.getApplication().getUIItem(ClientLib.Data.Missions.PATH.BAR_NAVIGATION).isVisible())
                {
                    createMaelstromTools();
                    window.MaelstromTools.Base.getInstance().initialize();
                } else
                {
                    window.setTimeout(MaelstromTools_checkIfLoaded, 1000);
                }
            } catch (e)
            {
                console.log("MaelstromTools_checkIfLoaded: ", e);
            }
        }

        if (/commandandconquer\.com/i.test(document.domain))
        {
            window.setTimeout(MaelstromTools_checkIfLoaded, 1000);
        }
    };

    try
    {
        var MaelstromScript = document.createElement("script");
        MaelstromScript.innerHTML = "(" + MaelstromTools_main.toString() + ")();";
        MaelstromScript.type = "text/javascript";
        if (/commandandconquer\.com/i.test(document.domain))
        {
            document.getElementsByTagName("head")[0].appendChild(MaelstromScript);
        }
    } catch (e)
    {
        console.log("MaelstromTools: init error: ", e);
    }
})();
