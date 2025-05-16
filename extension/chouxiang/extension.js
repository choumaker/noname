import { lib, game, ui, get, ai, _status } from "../../noname.js";
export const type = "extension";
export default function(){
	return {name:"chouxiang",arenaReady:function () {

        },content:function (config, pack) {

        },prepare:function () {

        },precontent:function () {

        },help:{},config:{},package:{
    character: {
        character: {
            erenxiaochuan: ["male","qun",5,["chouxiang_zuikui","chouxiang_dongying"],["zhu","des:罪魁祸首","ext:chouxiang/erenxiaochuan.jpg","die:ext:chouxiang/audio/die/erenxiaochuan.mp3"]],
            cx_otto: ["male","wei",3,[],["des:教父"]],
        },
        translate: {
            erenxiaochuan: "恶人笑川",
            chouxiang: "抽象",
            cx_otto: "电棍",
        },
    },
    card: {
        card: {
        },
        translate: {
        },
        list: [],
    },
    skill: {
        skill: {
            "chouxiang_zuikui": {
                trigger: {
                    global: "damageBegin4",
                },
                forced: true,
                async content(event, trigger, player) {
                    trigger.source = player; // 将伤害来源改为自己
                    //trigger.num+=2; // 增加伤害数值，测试用
                },
                ai: {
                    threaten: 1.5,
                    effect: {
                        target(card, player, target) {
                            if (get.type(card) == "damage") {
                                return [0, 0.5]; // 受到伤害的效果
                            }
                        },
                    },
                },
                "_priority": 0,
            },
            "chouxiang_dongying": {
                trigger: {
                    player: "useCardToPlayered",
                },
                zhuSkill: true,
                forced: true,
                filter(event, player) {
                    return event.card.name == "nanman" && !event.getParent().directHit.includes(event.target);
                },
                async content(event, trigger, player) {
                    if (trigger.target.group == "qun") return; // 对群雄角色无影响

                    const id = trigger.target.playerid;
                    const map = trigger.getParent().customArgs;
                    if (!map[id]) map[id] = {};
                    if (typeof map[id].shaRequired == "number") {
                        map[id].shaRequired++;
                    } else {
                        map[id].shaRequired = 2;
                    }
                    await player.popup("东瀛");
                },
                ai: {
                    threaten: 1.5,
                    effect: {
                        target(card, player, target) {
                            if (target.group == "qun") return 0; // 对群雄角色无影响
                            if (get.type(card) == "trick" && card.name == "nanman") {
                                return [0, 0.5]; // 南蛮入侵的效果
                            }
                        },
                    },
                },
                "_priority": 0,
            },
            "chouxiang_test_manqin": {
                trigger: {
                    player: "phaseBegin",
                },
                forced: true,
                async content(event, trigger, player) {
                    await player.gain(game.createCard("nanman"), "gain2"); // 获得一张南蛮入侵
                },
                ai: {
                    threaten: 1.5,
                },
                "_priority": 0,
            },
        },
        translate: {
            "chouxiang_zuikui": "罪魁",
            "chouxiang_zuikui_info": "锁定技，所有即将最终结算的伤害，来源均视为你。",
            "chouxiang_dongying": "东瀛",
            "chouxiang_dongying_info": "主公技，锁定技，非群雄势力角色响应你使用的【南蛮入侵】，需要额外打出一张杀。",
            "chouxiang_test_manqin": "蛮侵",
            "chouxiang_test_manqin_info": "【测试用】锁定技，回合开始时，获得一张南蛮入侵。",
        },
    },
    intro: "",
    author: "choumaker",
    diskURL: "",
    forumURL: "",
    version: "1.0",
},files:{"character":["erenxiaochuan.jpg","cx_otto.jpg"],"card":[],"skill":[],"audio":[]},connect:false} 
};