// ==UserScript==
// @name        CnC-TA Lister
// @namespace   https://github.com/ffi82/CnC-TA/
// @version     2024-10-20
// @description Under 'Scripts' menu, click to download CSV files containing Alliance Cities, Alliances, Players and Cities, Player Hall Of Fame / Challenge ranking, Alliance Roster, Alliance Cities and POIs data. How to: Click --> See progress bar above game options --> check your downloads folder for new .csv file/s. (Check your browser console [ Control+Shift+J ] in Chrome / Edge / Firefox for some logs.)
// @author      ffi82
// @match       https://*.alliances.commandandconquer.com/*/index.aspx*
// @updateURL   https://github.com/ffi82/CnC-TA/raw/master/CnC-TA_Lister.meta.js
// @downloadURL https://github.com/ffi82/CnC-TA/raw/master/CnC-TA_Lister.user.js
// @icon        data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAk5JREFUeF7tWctxwjAQlStIC1RAAxlmyDFpJWfOIWfOaSU5hhkqSAfpxEExGDBa7a5XljX244ok73v7tD9Vbua/aub4HQiAAmbOAK7AzAWAIDjaFdgdXt6u1bdZfb6PocZRCNgdnr+dq9a3gOv9ZvX1lJuE7AScPL8lgG5zKwEE5JYcFNAEP1wBxIAwAwiCyAKZCyKkQaTBzAygDkAdgEIIlSBKYfQCaIbQDaIbnFI3qJnwWipBzXekBa65GQoDoie8fQkIT5KdeX6QgIDQiNvzHyahDwEEePIbUu/7dSYCGDBBA7UE0OBbmCYVmAjwJvAG3ipBQwB/9j8J4xKgJUFKgAy8/TXJrICzEHmDG2MlBPBn0TFGc/9FMaCbevwmanDJG17vj2+C+1gzdAye6/t3wy4sNsu0G7gha1QBEW+R944joarcb127RchTsf8u61nw3TI7GiOSEyCLCVqhntfH7zzhsPwEDEMCH/CKIiAtCTz45nvBcds4CpBnB+46yMAXS4BNCXLwRROgJ6FJl1wK62qnyCtwbSSXIpu1Oq/fnl9gDLj3EtU92sAXfwV4JfT3PBNwh8gCqY1NcR754tSfAM/s68fjz2L5sLxPVsmMJnsLLkFePO/Bkz2EjYB499Y2N1JbB1gXa554J4naYVn0HgCb/Uh2WCIkIPqiazdzkBN47/vPigjQFzKDIFIcKgOvIuCSZyUDC4WtSZfqK0ixAgIVV1LTUxymLZ3VCkhhZGln9FJAaSAs9oAAC3tT2AsFTMGLFgxQgIW9Kez9A8eY4FA22gNKAAAAAElFTkSuQmCC
// @require     https://github.com/ffi82/CnC-TA/raw/master/Tiberium_Alliances_Zoom.user.js
// @require     https://github.com/bloofi/CnC_TA/raw/master/CnCTA-Base-Finder.user.js
// @grant       none
// ==/UserScript==
(() => {
    'use strict';
    const ListerScript = () => {
        const scriptName = 'CnC-TA Lister';
        let timestamp,
            Alliances,
            AlliancesArr,
            AlliancesArr2,
            Players,
            PlayersArr,
            PlayersArr2,
            Cities,
            CitiesArr,
            CitiesCount,
            AllianceCitiesArr;
        /*
         ** get Alliances list
         */
        function getAlliances() {
            timestamp = performance.now();
            Alliances = "";
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
                AlliancesArr.push({
                    "Ranking": getAlliance.r,
                    "Alliance_Id": getAlliance.a,
                    "Alliance_Name": getAlliance.an,
                    "Alliance_Has_Won": getAlliance.aw,
                    "Member_Count": getAlliance.pc,
                    "Base_Count": getAlliance.bc,
                    "Top_40_scores": getAlliance.s,
                    "Average_Score": getAlliance.sa,
                    "Total_Score": getAlliance.sc,
                    "Event_Rank": getAlliance.er,
                    "Event_Score": getAlliance.es,
                    "Average_Faction": getAlliance.fac
                });
                getPublicAllianceInfoById(getAlliance.a);
            }
        }

        function getPublicAllianceInfoById(n) {
            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("GetPublicAllianceInfo", {
                id: n
            }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, data) => {
                AlliancesArr2.push({
                    "Abbreviation": data.a,
                    "CiC_Player_Id": data.cic,
                    "Bases_Destroyed": data.bd,
                    "Bases_Destroyed_Environment": data.bde,
                    "Bases_Destroyed_Player": data.bdp,
                    "POI_Count:": data.poi,
                    "Is_Inactive": data.ii,
                    "EndGame_Won_Rank": data.egwr,
                    "EndGame_Won_Step": data.egws,
                    "Description": '"' + data.d + '"'
                });
                progressBar(AlliancesArr2.length, AlliancesArr.length, "Alliances");
                if (AlliancesArr.length === AlliancesArr2.length) {
                    for (let i = 0; i < AlliancesArr.length; i++) {
                        Alliances += String([Object.values(AlliancesArr.at(i)), Object.values(AlliancesArr2.at(i))]) + "\r\n";
                    }
                    Alliances = String([Object.keys(AlliancesArr[0]), Object.keys(AlliancesArr2[0])]) + "\r\n" + Alliances;
                    console.log(Alliances);
                    getCSV(Alliances, "Alliances");
                    console.log(`%cAlliances (${AlliancesArr.length}) list done in ${msToTime(performance.now() - timestamp)}`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
                }
            }), null);
        }
        /*
         ** get Players and Cities list
         */
        function getPlayersAndCities() {
            timestamp = performance.now();
            Players = "";
            Cities = "";
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
                const s = ClientLib.Data.MainData.GetInstance().get_Server().get_Name();
                PlayersArr2.push({
                    "Player_Ranking": data.r,
                    "Player_Id": data.i,
                    "Player_Name": data.n,
                    "Player_Faction": data.f,
                    "Player_Score": data.p,
                    "Alliance_Id": data.a,
                    "Alliance_Name": data.an,
                    "Player_Bases_Count": data.c.length,
                    "Player_versus_Bases": data.bd,
                    "Player_versus_Environment": data.bde,
                    "Player_versus_Player": data.d,
                    "Player_has_Code": data.hchc,
                    "Player_Endgame_Won_Count": data.ew.length,
                    "Player_Challange_Won_Count": data.cw.length,
                    "Player_Other_Won_Count": data.mw.length,
                    "Player_Distance_to_Center": data.dccc,
                    "Player_is_Inactive": data.ii,
                    "Player_lr": data.lr,
                    "Player_mv": data.mv,
                    "Player_np": data.np,
                    "Player_nr": data.nr,
                    "Player_sli_Count": data.sli.length,
                    "Player_is_Veteran_Points": data.vp,
                    "Endgame_Won_Server_Name": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).n : '',
                    "Endgame_Won_Rank": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).r : '',
                    "Endgame_Won_Alliance": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).an : '',
                    "Endgame_Won_Timestamp": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).ws : '',
                    "Endgame_Won_Member_Role": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).mr : '',
                    "Endgame_Won_Member_Faction": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).f : '',
                    "Endgame_Won_Member_is": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).is : '',
                    "Endgame_Won_Member_iv": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).iv : '',
                });
                progressBar(PlayersArr2.length, PlayersArr.length, "Players");
                if (PlayersArr.length === PlayersArr2.length) {
                    for (let p = 0; p < PlayersArr2.length; p++) {
                        Players += String(Object.values(PlayersArr2[p])) + "\r\n";
                    }
                    console.table(PlayersArr2);
                    Players = Object.keys(PlayersArr2[0]) + "\r\n" + Players;
                    getCSV(Players, "Players");
                    console.log(`%cPlayers (${PlayersArr2.length}) list done in ${msToTime(performance.now() - timestamp)}`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
                    timestamp = performance.now();
                }
                //start Cities list: get city ids from players list
                for (const getCityId of data.c) {
                    getPublicCityInfoById(getCityId.i);
                }
            }), null);
        }

        function getPublicCityInfoById(n) {
            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('GetPublicCityInfoById', {
                id: n
            }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, data) => {
                CitiesArr.push({
                    "Base_Ranking": 0,
                    "Alliance_Name": data.an,
                    "Alliance_Id": data.a,
                    "Player_Name": data.pn,
                    "Player_Id": data.p,
                    "Base_Name": data.n,
                    "Base_Id": data.i,
                    "Faction": data.f,
                    "Base_is_Ghost": data.g,
                    "Player_has_Won": data.w,
                    "Base_Score": data.po,
                    "Base_Coord_X": data.x,
                    "Base_Coord_Y": data.y,
                    "Base_Sector": getSector(data.x, data.y),
                    "Base_Distance_From_Center": getDistanceFromCenter(data.x, data.y)
                });
                progressBar(CitiesArr.length, CitiesCount, "Cities");
                if (CitiesArr.length === CitiesCount) { //when CitiesArr ready, start to build the list
                    CitiesArr.sort((a, b) => b.Base_Score - a.Base_Score); //Sort cities by score descending
                    for (let c = 0; c < CitiesArr.length; c++) {
                        CitiesArr.at(c).Base_Ranking = c + 1; //fill City Ranking by score
                        Cities += Object.values(CitiesArr.at(c)) + "\r\n"; //Add to Cities list
                    }
                    console.table(CitiesArr);
                    Cities = Object.keys(CitiesArr[0]) + "\r\n" + Cities;
                    getCSV(Cities, "Cities");
                    console.log(`%cCities (${CitiesArr.length}) list done in ${msToTime(performance.now() - timestamp)}`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
                }
            }), null);
        }
        /*
         ** get Player Hall Of Fame list
         */
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
                    let PlayerHallOfFame = "",
                        phofArr = [];
                    for (const getPHOF of data.phof) {
                        phofArr.push({
                            "Ranking": getPHOF.r,
                            "Player_Id": getPHOF.p,
                            "Player_Name": getPHOF.pn,
                            "Season_Won": getPHOF.sw,
                            "Total_Veteran_Points": getPHOF.tvp
                        });
                        progressBar(phofArr.length, data.phof.length, "Player Hall of Fame");
                        PlayerHallOfFame += Object.values(getPHOF) + "\r\n";
                        //progressBar([...PlayerHallOfFame].reduce((a, c) => a + (c === '\n' ? 1 : 0), 0) - 1,data.phof.length," Player Hall of Fame"); //slow... makes phofArr redundant though
                    }
                    console.table(phofArr); //phofArr <=> data.phof
                    PlayerHallOfFame = Object.keys(phofArr[0]) + "\r\n" + PlayerHallOfFame;
                    getCSV(PlayerHallOfFame, "PlayerHallOfFame");
                    console.log(`%cPlayer Hall Of Fame (${Object.values(data.phof).length}) list done in ${msToTime(performance.now() - timestamp)}`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
                }), null);
            }), null);
        }
        /*
         ** get Alliance Roster
         */
        function getAllianceRoster() {
            timestamp = performance.now();
            const roster = ClientLib.Data.MainData.GetInstance().get_Alliance().get_MemberDataAsArray();
            var AllianceRoster = "Id,Name,Role,Rank,Points,Bases,OnlineState,LastSeen,ActiveState,Level,Faction,JoinStep,HasControlHubCode,VeteranPointContribution,AvgDefenseLvl,AvgOffenseLvl,BestOffenseLvl,BestDefenseLvl,RoleName\r\n";
            for (const member of roster) {
                AllianceRoster += Object.values(member) + "\r\n";
                progressBar([...AllianceRoster].reduce((a, c) => a + (c === '\n' ? 1 : 0), 0) - 1, roster.length, "Alliance Roster");
            }
            console.table(roster);
            getCSV(AllianceRoster, "AllianceRoster");
            console.log(`%cAlliance Roster (${roster.length}) list done in ${msToTime(performance.now() - timestamp)}`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
        }
        /*
         ** get Points Of Interest list
         */
        function getPOIs() {
            const region = ClientLib.Vis.VisMain.GetInstance().get_Region();
            const zoomFactor = region.get_ZoomFactor();
            timestamp = performance.now();
            if (zoomFactor !== 0.01 && confirm(`Switch to region view and set zoom factor @ 0.01 to be able to capture all POIs.\r\nYour current zoom factor: ${zoomFactor}\r\n\r\nClick 'Points of Interest' again once region view has loaded.`)) {
                ClientLib.Config.Main.GetInstance().SetConfig(ClientLib.Config.Main.CONFIG_VIS_REGION_MINZOOM, 0); //Uncheck 'Allow max zoom out' in game options
                region.set_ZoomFactor(0.01);
                qx.core.Init.getApplication().showMainOverlay(!1);
            } else {
                const range = ClientLib.Data.MainData.GetInstance().get_Server().get_ContinentWidth(),
                    x = ClientLib.Data.MainData.GetInstance().get_Server().get_ContinentWidth(),
                    y = ClientLib.Data.MainData.GetInstance().get_Server().get_ContinentHeight(),
                    m = ClientLib.Data.MainData.GetInstance().get_Server().get_MaxCenterLevel();
                let POIScore = [],
                    AllPOIs = [],
                    POIs = "";
                for (let a = 0; a <= m; a++) POIScore[a] = ClientLib.Base.PointOfInterestTypes.GetScoreByLevel(a);
                for (let i = x - (range); i < (x + range); i++) {
                    for (let j = y - range; j < (y + range); j++) {
                        let visObject = region.GetObjectFromPosition(i * region.get_GridWidth(), j * region.get_GridHeight());
                        if (visObject != null && visObject.get_VisObjectType() == ClientLib.Vis.VisObject.EObjectType.RegionPointOfInterest && visObject.get_Name() != 'Tunnel exit') {
                            AllPOIs.push({
                                "POI_Level": visObject.get_Level(),
                                "POI_Name": visObject.get_Name().split(' ')[0],
                                "POI_Coord_X": i,
                                "POI_Coord_Y": j,
                                "POI_Owner_Alliance_Name": visObject.get_OwnerAllianceName(),
                                "POI_Score": POIScore[visObject.get_Level()],
                                "POI_Type": visObject.get_Type(),
                                "POI_Sector": getSector(i, j),
                                "POI_Distance_From_Center": getDistanceFromCenter(i, j),
                            });
                        }
                    }
                }
                AllPOIs.sort((a, b) => b.POI_Level - a.POI_Level);
                AllPOIs.sort((a, b) => a.POI_Type - b.POI_Type);
                for (const poi of AllPOIs) POIs += Object.values(poi) + "\r\n";
                console.table(AllPOIs);
                POIs = Object.keys(AllPOIs[0]) + "\r\n" + POIs;
                getCSV(POIs, "POIs");
                console.log(`%cPoints of Interest (${AllPOIs.length}) list done in ${msToTime(performance.now() - timestamp)}`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
                confirm("Done. World POI list was downloaded.\r\nReset zoom factor?") ? region.set_ZoomFactor(1) && ClientLib.Config.Main.GetInstance().SetConfig(ClientLib.Config.Main.CONFIG_VIS_REGION_MINZOOM, 1) : null;
            }
        }
        /*
         ** get Alliance Cities list
         */
        async function getAllianceCities() {
            const memberDataAsArray = ClientLib.Data.MainData.GetInstance().get_Alliance().get_MemberDataAsArray();
            timestamp = performance.now();
            AllianceCitiesArr = [];

            // Sequentially process each member's public info
            for (const member of memberDataAsArray) {
                await getPublicPlayerInfoByIdAC(member.Id); // Sequential execution
            }

            // After processing all cities, sort and process the city IDs
            AllianceCitiesArr.sort((a, b) => b.Base_Score - a.Base_Score);
            AllianceCitiesArr.sort((a, b) => a.Player_Id - b.Player_Id);

            console.table(AllianceCitiesArr);

            // Process cities asynchronously (but sequentially)
            await processCityIDs(AllianceCitiesArr.map(item => item.Base_Id));
        }

        async function getPublicPlayerInfoByIdAC(playerId) {
            try {
                const data = await new Promise((resolve, reject) => {
                    ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand(
                        'GetPublicPlayerInfo', {
                            id: playerId
                        },
                        webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, data) => {
                            resolve(data);
                        }), reject);
                });

                const s = ClientLib.Data.MainData.GetInstance().get_Server().get_Name();
                for (const city of data.c) {
                    AllianceCitiesArr.push({
                        "Server_Name": s,
                        "Alliance_Name": data.an,
                        "Alliance_Id": data.a,
                        "Player_Name": data.n,
                        "Player_Id": data.i,
                        "Player_Faction": data.f,
                        "Player_Ranking": data.r,
                        "Player_Score": data.p,
                        "Player_Bases_Count": data.c.length,
                        "Player_Distance_to_Center": data.dccc,
                        "Player_has_Code": data.hchc,
                        "Player_versus_Bases": data.bd,
                        "Player_versus_Environment": data.bde,
                        "Player_versus_Player": data.d,
                        "Player_is_Inactive": data.ii,
                        "Player_Endgame_Won_Count": data.ew.length,
                        "Player_Challange_Won_Count": data.cw.length,
                        "Player_Other_Won_Count": data.mw.length,
                        "Endgame_Won_Server_Name": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).n : '',
                        "Endgame_Won_Rank": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).r : '0',
                        "Endgame_Won_Alliance": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).an : '',
                        "Endgame_Won_Timestamp": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).ws : '',
                        "Endgame_Won_Member_Role": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).mr : '',
                        "Base_Name": city.n,
                        "Base_Id": city.i,
                        "Base_Score": city.p,
                        "Base_Coord_X": city.x,
                        "Base_Coord_Y": city.y,
                        "Base_Sector": getSector(city.x, city.y),
                        "Base_Distance_from_Center": getDistanceFromCenter(city.x, city.y),
                    });
                }
            } catch (error) {
                console.error(`Error fetching player info for ID ${playerId}:`, error);
            }
        }

        function loadCity(id) {
            return new Promise((resolve) => {
                ClientLib.API.Util.SetPlayAreaView(ClientLib.Data.PlayerAreaViewMode.pavmNone, id, 0, 0); // Set the play area view for the current city
                //webfrontend.gui.UtilView.selectAndCenterCityOnRegionViewWindow(id);
                const checkLoading = setInterval(() => {
                    const loadedCity = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity();
                    // Check if the loaded city's ID matches the requested city ID
                    if (loadedCity && loadedCity.get_Id() === id && loadedCity.get_FoundStep()) {
                        clearInterval(checkLoading);
                        resolve(loadedCity);
                    }
                }, 200);
            });
        }

        async function processCityIDs(cityIds) {
            let processedCount = 0;
            let AllianceCities = "";
            let failedCities = [];

            for (const cityId of cityIds) {
                try {
                    // Wait for the city to load
                    const loadedCity = await loadCity(cityId);
                    const cityData = {
                        ...AllianceCitiesArr.find(city => city.Base_Id === cityId),
                        "Base_Found_Step": loadedCity.get_FoundStep(),
                        "Base_is_Ghost": loadedCity.get_IsGhostMode(),
                        "Base_Tiberium_per_Hour": loadedCity.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Tiberium, true, true),
                        "Base_Crystal_per_Hour": loadedCity.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Crystal, true, true),
                        "Base_Power_per_Hour": loadedCity.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Power, true, true),
                        "Base_Credits_per_Hour": (loadedCity.get_CityCreditsProduction().Delta + loadedCity.get_CityCreditsProduction().ExtraBonusDelta) * 3600,
                        "Base_Base_Level": loadedCity.get_LvlBase(),
                        "Base_Defense_Level": loadedCity.get_LvlDefense(),
                        "Base_Offense_Level": loadedCity.get_LvlOffense(),
                        "Base_Construction_Yard_Level": loadedCity.get_ConstructionYardLevel(),
                        "Base_Command_Center_Level": loadedCity.get_CommandCenterLevel(),
                    };
                    qx.core.Init.getApplication().showMainOverlay(!1);
                    if (!loadedCity) {
                        failedCities.push(cityId);
                        continue;
                    }
                    console.log(cityData);
                    processedCount++;
                    AllianceCities += Object.values(cityData).join(",") + "\r\n";
                    progressBar(processedCount, cityIds.length, "Alliance Cities");

                    if (processedCount === cityIds.length) {
                        AllianceCities = Object.keys(cityData).join(",") + "\r\n" + AllianceCities;
                        getCSV(AllianceCities, "AllianceCities");
                        console.log(AllianceCities);
                        console.log(`%cAlliance Cities (${cityIds.length}) list done in ${msToTime(performance.now() - timestamp)}`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
                    }
                } catch (error) {
                    console.error(`Error loading City ID ${cityId}:`, error);
                    failedCities.push(cityId);
                }
            }
            if (failedCities.length > 0) {
                console.warn(`Failed to load ${failedCities.length} cities:`, failedCities);
            }
        }
        /*
         ** helper functions
         */
        //list to CSV (Comma Separated Values file)
        function getCSV(data, name) {
            let elLink = document.createElement("a");
            let oBlob = new Blob([data], {
                type: 'text/csv;charset=utf-8;'
            });
            elLink.download = new Date().toISOString().slice(0, -14) + "_" + ClientLib.Data.MainData.GetInstance().get_Server().get_WorldId() + "_" + name;
            let oLastUrl = window.URL.createObjectURL(oBlob);
            elLink.href = oLastUrl;
            document.body.appendChild(elLink);
            elLink.click();
            document.body.removeChild(elLink);
            elLink = null;
        }
        // Progress bar for the lists
        function progressBar(pbIndex, pbLength, pbName) {
            const app = qx.core.Init.getApplication();
            const optionsBar = app.getOptionsBar().getLayoutParent().getChildren()[0].getChildren()[2];
            let pbContainer = optionsBar.getChildren().find(child => child.getUserData("pbContainer")); // Try to find an existing pbContainer in the parent
            if (!pbContainer) { // If pbContainer doesn't exist, create and add it
                pbContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
                    padding: 0,
                    width: 115,
                    decorator: new qx.ui.decoration.Decorator().set({
                        width: 1,
                        style: "solid",
                        color: "black",
                        backgroundColor: "transparent",
                    }),
                });
                pbContainer.setUserData("pbContainer", true); // Mark this container with user data to identify it later
                optionsBar.addAt(pbContainer, 1); // Add pbContainer only once
            }
            let pb = pbContainer.getChildren()[0];
            if (!pb) { // If no progress bar exists inside pbContainer, create one
                pb = new qx.ui.basic.Label();
                pb.set({
                    value: pbIndex + " / " + pbLength + " " + pbName,
                    width: 0,
                    height: 11,
                    textColor: "black",
                    font: qx.bom.Font.fromString("9px tahoma"),
                    backgroundColor: "white",
                    decorator: "main",
                });
                pbContainer.add(pb);
            }
            pb.set({ // Update the progress label and width
                value: pbIndex + " / " + pbLength + " " + pbName,
                width: (pbIndex / pbLength) * 113,
            });
            if (pbIndex === pbLength) { // Remove pbContainer when progress is complete
                pbContainer.getLayoutParent().remove(pbContainer);
            }
        }
        //convert milliseconds to time format "hh:mm:ss:mmm"
        function msToTime(milliseconds) {
            const hours = Math.floor(milliseconds / (1000 * 60 * 60));
            const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
            const millisecondsLeft = Math.floor(milliseconds % 1000);
            return `${hours.toString().padStart(2, '0')}h:${minutes.toString().padStart(2, '0')}m:${seconds.toString().padStart(2, '0')}s:${millisecondsLeft.toString().padStart(3, '0')}ms`;
        }
        //get world sector abbreviation by coords
        function getSector(x, y) {
            const qxApp = qx.core.Init.getApplication();
            const WorldWidth2 = Math.floor(ClientLib.Data.MainData.GetInstance().get_Server().get_WorldWidth() / 2);
            const WorldHeight2 = Math.floor(ClientLib.Data.MainData.GetInstance().get_Server().get_WorldHeight() / 2);
            const SectorCount = ClientLib.Data.MainData.GetInstance().get_Server().get_SectorCount();
            const WorldCX = (WorldWidth2 - x);
            const WorldCY = (y - WorldHeight2);
            const WorldCa = ((Math.atan2(WorldCX, WorldCY) * SectorCount) / (2 * Math.PI)) + (SectorCount + 0.5);
            const SectorNo = Math.floor(WorldCa) % SectorCount;
            return qxApp.tr(`tnf:${['south', 'southwest', 'west', 'northwest', 'north', 'northeast', 'east', 'southeast'][SectorNo]} abbr`);
        }
        //get distance from center by coords
        function getDistanceFromCenter(x, y) {
            const Fortress = ClientLib.Data.MainData.GetInstance().get_EndGame().get_Hubs().d[1];
            const fx = Fortress.get_X() + Fortress.get_SizeX() / 2;
            const fy = Fortress.get_Y() + Fortress.get_SizeY() / 2;
            //return ((ClientLib.Data.MainData.GetInstance().get_Server().get_WorldWidth() / 2 - x) ** 2 + (ClientLib.Data.MainData.GetInstance().get_Server().get_WorldHeight() / 2 - y) ** 2) ** .5;
            return Math.sqrt((fx - x) ** 2 + (fy - y) ** 2); //distance formula in cartesian coordinates : d = √[(x₂ - x₁)² + (y₂ - y₁)² + (z₂ - z₁)²] (z1=0 ,z2=0 in 2D spaces)
        }
        /*
         ** initialization logic
         */
        //add to Scripts menu
        function init() {
            const ScriptsButton = qx.core.Init.getApplication().getMenuBar().getScriptsButton(),
                children = ScriptsButton.getMenu().getChildren(),
                iconGreen = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAG1JREFUOE9jZKAQMFKonwG/AQ0M/8EWNOBWN2oAAy0CETnkcbGR4h4RCy0M8gw1DA+h0QaJPnQAi04ktQgDQLYhxzfMdpgh6HJQPm4DIAkIe0JCsgzVAAKpDu4jrAYg20gogyB5h8aZiZBLgPIA/0oqEY62gBUAAAAASUVORK5CYII=',
                iconLime = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAGpJREFUOE9jZKAQMFKonwG/Af8Z/oMtYMStbtQAUPDgA2QFIrImXGwkSxEuaGGQZ6hheAiWg2lEdx0sOpHUIgwAaUKOb3RD0OWgfNwGILsEPSEhWYZqAIFUB/cRVgPw+R1XWIBTOYWAYgMAXJ0qEdD91o0AAAAASUVORK5CYII=',
                iconRed = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAGxJREFUOE9jZKAQMFKonwGvAf8ZGP6DLGAEI+xg1AA8gQMKMrICEVkTLjZyfCBioYVBnqGG4SGyzegRB49OJLVwA0C2Icc3zHaYIehyMD5OA/CFAbJlKAYQSnUw12A1AJ/fcYYFJJlTBig2AABvnSoRu23XWQAAAABJRU5ErkJggg==',
                iconBlue = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAG5JREFUOE9jZKAQMFKonwGvAU6tX/6DLNhXzYNT3agBDDQIROSQx8VGjnpELLQwyDPUMDwEScI0oqcReHQiqYUbANKEHN/ohqDLwfg4DUB2CXpCQrYMxQBCqQ7mJawG4PM7zrBgIBCNxGQ0inMjAD6pUBFgbmXxAAAAAElFTkSuQmCC';
            ScriptsButton.Add('Alliances', iconLime);
            ScriptsButton.Add('Players and Cities', iconLime);
            ScriptsButton.Add('Player Hall of Fame', iconLime);
            ScriptsButton.Add('Alliance Roster', iconLime);
            ScriptsButton.Add('Alliance Cities', iconRed);
            ScriptsButton.Add('Points of Interest', iconBlue);
            children[children.length - 6].addListener('execute', getAlliances, null);
            children[children.length - 5].addListener('execute', getPlayersAndCities, null);
            children[children.length - 4].addListener('execute', getPlayerHallOfFame, null);
            children[children.length - 3].addListener('execute', getAllianceRoster, null);
            children[children.length - 2].addListener('execute', getAllianceCities, null);
            children[children.length - 1].addListener('execute', getPOIs, null);
        }
        //wait for game
        function GO() {
            try {
                if (typeof qx !== 'undefined' && qx.core.Init.getApplication().initDone && qx.core.Init.getApplication().getMenuBar().getScriptsButton() !== 'undefined') {
                    init();
                    console.log(`%c${scriptName} loaded`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
                } else {
                    window.setTimeout(GO, 1000);
                }
            } catch (e) {
                console.log(`Failed to init script ${scriptName}:`, e);
            }
        }
        GO();
    }
    /*
     ** inject script
     */
    if (/commandandconquer\.com/i.test(document.domain)) {
        try {
            const script_block = document.createElement('script');
            script_block.innerHTML = `(${ListerScript.toString()})();`;
            script_block.type = 'text/javascript';
            document.getElementsByTagName('head')[0].appendChild(script_block);
        } catch (e) {
            console.log(`Failed to inject script ${scriptName}:`, e);
        }
    }
})();
