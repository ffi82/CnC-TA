"use strict";
// ==UserScript==
// @name        CnC-TA Lister
// @namespace   https://github.com/ffi82/CnC-TA/
// @version     2024-09-02
// @description Under "scripts" menu, click to download CSV files containing Alliances, Playes, Cities, Alliance Roster and POIs data. Click (---> confirm prompts for POIs list <- uses ClientLib.Vis) ---> wait ---> check your downloads folder for new .csv file/s ---> check your browser console [ Control+Shift+J ] in Chrome / Edge / Firefox
// @author      ffi82
// @contributor leo7044 (https://github.com/leo7044/CnC_TA), bloofi (https://github.com/bloofi), c4l10s <== i took pieces of code from... indirect contribution :P
// @downloadURL https://github.com/ffi82/CnC-TA/raw/master/CnC-TA_Lister.user.js
// @updateURL   https://github.com/ffi82/CnC-TA/raw/master/CnC-TA_Lister.user.js
// @match       https://*.alliances.commandandconquer.com/*/index.aspx*
// @icon        data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAG1JREFUOE9jZKAQMFKonwG/AQ0M/8EWNOBWN2oAAy0CETnkcbGR4h4RCy0M8gw1DA+h0QaJPnQAi04ktQgDQLYhxzfMdpgh6HJQPm4DIAkIe0JCsgzVAAKpDu4jrAYg20gogyB5h8aZiZBLgPIA/0oqEY62gBUAAAAASUVORK5CYII=
// @require     https://github.com/ffi82/CnC-TA/raw/master/Tiberium_Alliances_Zoom.user.js
// @grant       none
// ==/UserScript==

(function () {
    const script = () => {
        const scriptName = 'C&C-TA Lister';
        var timestamp, Alliances, AlliancesArr, AlliancesArr2, Players, PlayersArr, PlayersArr2, CitiesArr, CitiesCount;

        function init() {
            const ScriptsButton = qx.core.Init.getApplication().getMenuBar().getScriptsButton();
            const children = ScriptsButton.getMenu().getChildren();
            const icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAG1JREFUOE9jZKAQMFKonwG/AQ0M/8EWNOBWN2oAAy0CETnkcbGR4h4RCy0M8gw1DA+h0QaJPnQAi04ktQgDQLYhxzfMdpgh6HJQPm4DIAkIe0JCsgzVAAKpDu4jrAYg20gogyB5h8aZiZBLgPIA/0oqEY62gBUAAAAASUVORK5CYII=';
            ScriptsButton.Add('Alliances', icon);
            ScriptsButton.Add('Players and Cities', icon);
            ScriptsButton.Add('Player Hall of Fame', icon);
            ScriptsButton.Add('Alliance Roster', icon);
            ScriptsButton.Add('Points of Interest', icon);
            children[children.length - 5].addListener('execute', getAlliances, this);
            children[children.length - 4].addListener('execute', getPlayersAndCities, this);
            children[children.length - 3].addListener('execute', getPlayerHallOfFame, this);
            children[children.length - 2].addListener('execute', getAllianceRoster, this);
            children[children.length - 1].addListener('execute', getPOIs, this);
        }

        //list to .csv
        function getCSV(data, name) {
            var elLink = document.createElement("a");
            var oBlob = new Blob([data], {
                type: 'text/csv;charset=utf-8;'
            });
            elLink.download = new Date().toISOString().slice(0, -14) + "_" + ClientLib.Data.MainData.GetInstance().get_Server().get_WorldId() + "_" + name;
            var oLastUrl = window.URL.createObjectURL(oBlob);
            elLink.href = oLastUrl;
            document.body.appendChild(elLink);
            elLink.click();
            document.body.removeChild(elLink);
            elLink = null;
        }

        //get Alliances list
        function getAlliances() {
            timestamp = performance.now();
            Alliances = "Ranking,Alliance Id,Alliance Name,Alliance Has Won,Member Count,Base Count,Top 40 scores,Average Score,Total Score,Event Rank,Event Score,Average Faction,Abbreviation,CiC Player Id,Bases destroyed,PvE,PvP,POI Count,Is Inactive,EndGame Won Rank,EndGame Won Step,Description\n";
            AlliancesArr = [];
            AlliancesArr2 = [];
            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("RankingGetCount", {
                view: 1
            }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, countof) => {
                ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('RankingGetData', {
                    ascending: true,
                    firstIndex: 0,
                    lastIndex: countof,
                    rankingType: 0,
                    sortColumn: 2,
                    view: 1,
                }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, onAllianceRankingGetData), null);
            }), null);
        }
        function onAllianceRankingGetData(context, data) {
            for (const getAlliance of data.a) {
                AlliancesArr.push(String([getAlliance.r, getAlliance.a, getAlliance.an, getAlliance.aw, getAlliance.pc, getAlliance.bc, getAlliance.s, getAlliance.sa, getAlliance.sc, getAlliance.er, getAlliance.es, getAlliance.fac]));
                getPublicAllianceInfoById(getAlliance.a);
            }
        }
        function getPublicAllianceInfoById(n) {
            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("GetPublicAllianceInfo", {
                id: n
            }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, data) => {
                AlliancesArr2.push(String([data.a, data.cic, data.bd, data.bde, data.bdp, data.poi, data.ii, data.egwr, data.egws, '"' + data.d + '"']));
                if (AlliancesArr.length === AlliancesArr2.length) {
                    for (let i = 0; i < AlliancesArr.length; i++) {
                        Alliances += String([AlliancesArr.at(i), AlliancesArr2.at(i)]) + "\n";
                    }
                    console.log(JSON.stringify(AlliancesArr.map((data, index) => String(data, AlliancesArr2[index])), undefined, 4));
                    getCSV(Alliances, "Alliances");
                    console.log(`%cAlliances (${AlliancesArr.length}) list done in ${((performance.now() - timestamp) / 1000).toFixed(2)} seconds.`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
                }
            }),null)
        }

        //get Players and Cities lists
        function getPlayersAndCities() {
            timestamp = performance.now();
            Players = "Ranking,Player Id,Player Name,Faction,Score,Alliance Id,Alliance Name,Bases,Bases destroyed,PvE,PvP,Has Code,Fortresses annihilated,Challange achievements,Other achievements,Distance to Center,Is Inactive,lr,mv,np,nr,sli.length,Veteran Points,World,Rank,Alliance,Timestamp,Member Role,Faction,is,iv\n";
            Cities = "Alliance Name,Alliance Id,Player Name,Player Id,Base Name,Base Id,Player Faction,Base is Ghost,Player has Won,Base Score,Coord X,Coord Y\n";
            PlayersArr = [];
            PlayersArr2 = [];
            CitiesArr = [];
            CitiesCount = 0;
            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("RankingGetCount", {
                view: 0 // console.log(Object.entries(ClientLib.Data.Ranking.EViewType).sort(values));
            }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, countof) => {
                ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('RankingGetData', {
                    ascending: 1, // console.log(Object.entries(ClientLib.Data.Ranking.ESortDirection).sort(values));
                    firstIndex: 0,
                    lastIndex: countof, // from "RankingGetCount"... one can also limit it: 10, 100, 25000 etc...
                    rankingType: 0, // console.log(Object.entries(ClientLib.Data.Ranking.ERankingType).sort(values));
                    sortColumn: 2, // console.log(Object.entries(ClientLib.Data.Ranking.ESortColumn).sort(values));
                    view: 0 // console.log(Object.entries(ClientLib.Data.Ranking.EViewType).sort(values));
                }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, onPlayerRankingGetData), null);
            }), null);
        }
        function onPlayerRankingGetData(context, data) {
            for (const getPlayer of data.p) {
                PlayersArr.push(getPlayer);
                CitiesCount += getPlayer.bc;
                getPublicPlayerInfoById(getPlayer.p);
            }
        }
        function getPublicPlayerInfoById(n) {
            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('GetPublicPlayerInfo', {
                id: n
            }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, data) => {
                var hasBadge = ""; // player endgame data for current world
                for (const badge of data.ew) {
                    if (badge.n === ClientLib.Data.MainData.GetInstance().get_Server().get_Name()) {
                        hasBadge = String([badge.n, badge.r, badge.an, badge.ws, badge.mr, badge.f, badge.is, badge.iv]);
                        break;
                    }
                }
                PlayersArr2.push(String([data.r, data.i, data.n, data.f, data.p, data.a, data.an, data.c.length, data.bd, data.bde, data.d, data.hchc, data.ew.length, data.cw.length, data.mw.length, data.dccc, data.ii, data.lr, data.mv, data.np, data.nr, data.sli.length, data.vp, hasBadge]));
                if (PlayersArr.length === PlayersArr2.length) {
                    for (let p = 0; p < PlayersArr2.length; p++) {
                        Players += String(PlayersArr2.at(p)) + "\n";
                    }
                    console.log(JSON.stringify(PlayersArr2, undefined, 4));
                    getCSV(Players, "Players");
                    console.log(`%cPlayers (${PlayersArr2.length}) list done in ${((performance.now() - timestamp) / 1000).toFixed(2)} seconds.`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
                    timestamp = performance.now();
                }
                //cities <- get city ids from players list
                for (const getCityId of data.c) {
                    getPublicCityInfoById(getCityId.i);
                }
            }), null);
        }
        function getPublicCityInfoById(n) {
            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('GetPublicCityInfoById', {
                id: n
            }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, data) => {
                CitiesArr.push(String([data.an, data.a, data.pn, data.p, data.n, data.i, data.f, data.g, data.w, data.po, data.x, data.y]));
                if (CitiesArr.length === CitiesCount) {
                    for (let c = 0; c < CitiesArr.length; c++) {
                        Cities += String(CitiesArr.at(c)) + "\n";
                    }
                    console.log(JSON.stringify(CitiesArr, undefined, 4));
                    getCSV(Cities, "Cities");
                    console.log(`%cCities (${CitiesArr.length}) list done in ${((performance.now() - timestamp) / 1000).toFixed(2)} seconds.`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
                }
            }), null)
        }

        //get Player Hall Of Fame list
        function getPlayerHallOfFame() {
            timestamp = performance.now();
            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("RankingGetCount", {
                view: 2
            }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, countof) => {
                ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('RankingGetData', {
                    ascending: true,
                    firstIndex: 0,
                    lastIndex: countof,
                    rankingType: 0,
                    sortColumn: 0,
                    view: 2
                }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, data) => {
                    let PlayerHallOfFame = "Ranking,Player Id,Player Name,Season Won,Total Veteran Points\n";
                    for (const getPHOF of data.phof) {
                        PlayerHallOfFame += String([getPHOF.r, getPHOF.p, getPHOF.pn, getPHOF.sw, getPHOF.tvp]) + "\n";
                    }
                    console.table(data.phof);
                    getCSV(PlayerHallOfFame, "PlayerHallOfFame");
                    console.log(`%cPlayer Hall Of Fame (${Object.values(data.phof).length}) list done in ${((performance.now() - timestamp) / 1000).toFixed(2)} seconds.`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
                }), null);
            }), null);
        }

        //get Alliance Roster
        function getAllianceRoster() {
            timestamp = performance.now();
            const roster = ClientLib.Data.MainData.GetInstance().get_Alliance().get_MemberDataAsArray(),
                  memberCount = ClientLib.Data.MainData.GetInstance().get_Alliance().get_NumMembers();
            var AllianceRoster = "Id,Name,Role,Rank,Points,Bases,OnlineState,LastSeen,ActiveState,Level,Faction,JoinStep,HasControlHubCode,VeteranPointContribution,AvgDefenseLvl,AvgOffenseLvl,BestOffenseLvl,BestDefenseLvl,RoleName\n";
            for (const member of roster) {
                AllianceRoster += String(Object.values(member)) + "\n"
            }
            console.table(roster);
            getCSV(AllianceRoster, "AllianceRoster");
            console.log(`%cAlliance Roster (${memberCount}) list done in ${((performance.now() - timestamp) / 1000).toFixed(2)} seconds.`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
        }

        //get Points Of Interest List
        function getPOIs(e) {
            timestamp = performance.now();
            if (ClientLib.Vis.VisMain.GetInstance().get_Region().get_MinZoomFactor() != 0.01) {
                if (confirm("Get 'Tiberium Alliances Zoom' userscript to enable true max zoom out in Region View. May reduce performance.\nAlso make sure the 'Allow max zoom out' in game Options -> Audio/Video tab is unchecked.")) {
                    open("https://github.com/ffi82/CnC-TA/raw/master/Tiberium%20Alliances%20Zoom.user.js")
                }
            } else {
                if (ClientLib.Vis.VisMain.GetInstance().get_Region().get_ZoomFactor() != 0.01) {
                    if (confirm("Set zoom factor @ 0.01 to be able to see the entire world... zoom out max.\nYour current zoom factor: " + ClientLib.Vis.VisMain.GetInstance().get_Region().get_ZoomFactor())) {
                        ClientLib.Vis.VisMain.GetInstance().get_Region().set_ZoomFactor(0.01)
                    };
                } else {
                    if (qx.core.Init.getApplication().getPlayArea().getViewMode() != 0) {
                        if (confirm("Switch to Region View.")) {
                            qx.core.Init.getApplication().showMainOverlay(!1)
                        }
                    } else {
                        var range = ClientLib.Data.MainData.GetInstance().get_Server().get_ContinentWidth();
                        var x = ClientLib.Data.MainData.GetInstance().get_Server().get_ContinentWidth();
                        var y = ClientLib.Data.MainData.GetInstance().get_Server().get_ContinentHeight();
                        var region = ClientLib.Vis.VisMain.GetInstance().get_Region();
                        var POIScore = [];
                        for (var a = 0; a <= ClientLib.Data.MainData.GetInstance().get_Server().get_MaxCenterLevel(); a++) {
                            POIScore[a] = ClientLib.Base.PointOfInterestTypes.GetScoreByLevel(a);
                        }
                        //var POIRank = []; for (var b = 0; b < 42; b++) {POIRank [b] = ClientLib.Base.PointOfInterestTypes.GetBoostModifierByRank();}
                        var Reactor = new Array();
                        var Tiberium = new Array();
                        var Crystal = new Array();
                        var Tungsten = new Array();
                        var Uranium = new Array();
                        var Aircraft = new Array();
                        var Resonator = new Array();
                        var AllPOIs = new Array();
                        var POIs = "";
                        /*
                        Add world name and timestamp on the first row of the.csv file if needed...
                        POIs += String([ClientLib.Data.MainData.GetInstance().get_Server().get_Name(),new Date().toISOString()])+"\n";
                         */
                        POIs += "Level,Name,coord_x,coord_y,Alliance,Score,Type\r\n"
                        for (var i = x - (range); i < (x + range); i++) {
                            for (var j = y - range; j < (y + range); j++) {
                                var visObject = region.GetObjectFromPosition(i * region.get_GridWidth(), j * region.get_GridHeight());
                                if (visObject != null) {
                                    try {
                                        if (visObject.get_VisObjectType() == ClientLib.Vis.VisObject.EObjectType.RegionPointOfInterest) {
                                            var visObjectName = visObject.get_Name();
                                            if (visObjectName == 'Tunnel exit') {}
                                            else {
                                                var POIlevel = visObject.get_Level();
                                                var POItype = visObject.get_Type();
                                                var Alliance = visObject.get_OwnerAllianceName();
                                                var visObjectShortName = visObjectName.split(' ')[0];
                                                var POIdata = String([POIlevel, visObjectShortName, i, j, Alliance, POIScore[POIlevel], POItype]);
                                                AllPOIs.push(POIdata);
                                                if (visObjectShortName == "Aircraft") {
                                                    Aircraft.push(POIdata);
                                                }
                                                if (visObjectShortName == "Uranium") {
                                                    Uranium.push(POIdata);
                                                }
                                                if (visObjectShortName == "Tungsten") {
                                                    Tungsten.push(POIdata);
                                                }
                                                if (visObjectShortName == "Tiberium") {
                                                    Tiberium.push(POIdata);
                                                }
                                                if (visObjectShortName == "Reactor") {
                                                    Reactor.push(POIdata);
                                                }
                                                if (visObjectShortName == "Crystal") {
                                                    Crystal.push(POIdata);
                                                }
                                                if (visObjectShortName == "Resonator") {
                                                    Resonator.push(POIdata);
                                                }
                                            }
                                        }
                                    } catch (e) {
                                        console.log(e);
                                    }
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
                        for (const agnt of Aircraft) {
                            POIs += agnt + "\n"
                        }
                        for (const uc of Uranium) {
                            POIs += uc + "\n"
                        }
                        for (const tc of Tungsten) {
                            POIs += tc + "\n"
                        }
                        for (const tcnh of Tiberium) {
                            POIs += tcnh + "\n"
                        }
                        for (const r of Reactor) {
                            POIs += r + "\n"
                        }
                        for (const ccnh of Crystal) {
                            POIs += ccnh + "\n"
                        }
                        for (const rnt of Resonator) {
                            POIs += rnt + "\n"
                        }
                        console.log({
                            'Tiberium Control Network Hub': Tiberium,
                            'Crystal Control Network Hub': Crystal,
                            'Reactor': Reactor,
                            'Tungsten Compound': Tungsten,
                            'Uranium Compound': Uranium,
                            'Aircraft Guidance Network Tower': Aircraft,
                            'Resonator Network Tower': Resonator
                        });
                        getCSV(POIs, "POIs");
                        console.log(`%cPoints of Interest (${[...POIs].reduce((a, c) => a + (c === '\n' ? 1 : 0), 0) - 1}) list done in ${((performance.now() - timestamp) / 1000).toFixed(2)} seconds.`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');                        if (confirm("Done. World POI list was downloaded.\nReset zoom factor?")) {
                            ClientLib.Vis.VisMain.GetInstance().get_Region().set_ZoomFactor(1)
                        }
                    }
                }
            }
        }

        //wait for game
        function checkForInit() {
            try {
                if (typeof qx !== 'undefined' &&
                    qx &&
                    qx.core &&
                    qx.core.Init &&
                    qx.core.Init.getApplication &&
                    qx.core.Init.getApplication() &&
                    qx.core.Init.getApplication().initDone) {
                    init();
                } else {
                    window.setTimeout(checkForInit, 1000);
                }
            } catch (e) {
                console.log(scriptName, e);
            }
        }
        checkForInit();
    }
    if (/commandandconquer\.com/i.test(document.domain)) {
        try {
            const script_block = document.createElement('script');
            script_block.innerHTML = `(${script.toString()})();`;
            script_block.type = 'text/javascript';
            document.getElementsByTagName('head')[0].appendChild(script_block);
        } catch (e) {
            console.log('Failed to inject script', e);
        }
    }
})();
