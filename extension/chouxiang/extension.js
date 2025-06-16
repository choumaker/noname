import { triggerRef } from "../../game/vue.esm-browser.js";
import { lib, game, ui, get, ai, _status } from "../../noname.js";
export const type = "extension";
export default function () {
	return {
		name: "chouxiang",
		arenaReady: function () { },
		content: function (config, pack) { },
		prepare: function () { },
		precontent: function () { },
		help: {},
		config: {},
		package: {
			character: {
				character: {
					erenxiaochuan: { sex: "male", group: "qun", hp: 5, skills: ["chouxiang_zuikui", "chouxiang_dongying"], descriptions: ["zhu", "des:罪魁祸首", "ext:chouxiang/erenxiaochuan.jpg", "die:ext:chouxiang/audio/die/erenxiaochuan.mp3"] },
					cx_otto: { sex: "male", group: "wei", hp: 3, skills: ["chouxiang_waao", "chouxiang_fangguan", "chouxiang_shuncong"], descriptions: ["des:教父"], hasHiddenSkill: true },
				},
				translate: {
					erenxiaochuan: "恶人笑川",
					chouxiang: "抽象",
					cx_otto: "电棍",
				},
			},
			card: {
				card: {},
				translate: {},
				list: [],
			},
			skill: {
				skill: {
					chouxiang_zuikui: {
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
						_priority: 0,
					},
					chouxiang_dongying: {
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
						_priority: 0,
					},
					chouxiang_test_manqin: {
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
						_priority: 0,
					},
					chouxiang_waao: {
						trigger: { player: "showCharacterAfter" },
						forced: true,
						hiddenSkill: true,
						filterCard: (event, player) => player.hasCard(player.canRecast(card), "h"),
						async content(event, trigger, player) {
							const players = game.filterPlayer();
							for (const p of players) {
								console.log(`Processing player: ${p.name}`);
								if (p.countCards("h") > 0) {
									const randomCard = p.getCards("h").randomGet();
									await p.recast(randomCard); // 随机重铸一张手牌
									if (get.suit(randomCard) == "heart") {
										await p.loseHp(1); // 弃置红桃牌的角色失去一点体力
									}
								} else {
									await p.loseHp(1); // 无手牌或弃置红桃牌的角色失去一点体力
								}
							}

							player.addTempSkill("chouxiang_waao_distance", { player: "phaseEnd" }); // 添加临时技能，直到回合结束
						},
					},
					chouxiang_waao_distance: {
						popup: false,
						mod: {
							globalFrom(from, to, distance) {
								return -Infinity; // 设置距离为1
							},
						},
					},
					chouxiang_shuncong: {
						trigger: { target: "useCardToTarget" },
						forced: true,
						filter(event, player) {
							if (!event.targets || !event.targets.includes(player)) return false;
							return event.player.hp <= 1 || event.player.hasSkill("chouxiang_fangguan_victim"); // 体力小于等于1的角色或有“房管”的角色
						},
						async content(event, trigger, player) {
							await player.draw(1); // 摸一张牌
							trigger.directHit.push(player); // 不能使用或打出手牌
						},
					},
					chouxiang_fangguan: {
						trigger: { target: "useCardToTargeted" }, // 触发时机是被指定为目标“后”。否则给了“房管”后，“顺从”也会立即触发
						filter(event, player) {
							if (!event || !event.targets || !event.targets.includes(player)) return false;
							return event.player != player && !event.player.hasSkill("chouxiang_fangguan_victim");
						},
						async content(event, trigger, player) {
							await player.draw(2); // 摸两张牌
							const cards = await player.chooseCard("he", true, `将一张牌作为“房管”置于其武将牌上`).forResultCards();
							const target = trigger.player;
							const card = cards[0];
							await player.give(cards[0], trigger.player, "give").gaintag.add("chouxiang_fangguan");
							await player.line(target); // 连接线
							await target.addToExpansion(card, player, "give").gaintag.add("chouxiang_fangguan_victim");
							await target.addSkill("chouxiang_fangguan_victim");
							target.markSkillCharacter("chouxiang_fangguan_victim", player, "房管", "对电棍使用牌无距离限制，电棍对“房管”使用牌无次数限制。回合结束时，选择一项：①令电棍回复一点体力，然后获得武将牌上的“房管”；②对电棍使用一张牌（需合法），然后弃置武将牌上的“房管”；③弃置一张坐骑牌；④交给电棍一张牌；⑤失去一点体力。");
							target.storage.chouxiang_fangguan_victim = player;
							await game.delayx();
						},
						mod: {
							cardUsableTarget(card, player, target) {
								if (target.hasSkill("chouxiang_fangguan_victim")) return true; // 对有“房管”的角色使用牌无次数限制
							},
						},
					},
					chouxiang_fangguan_victim: {
						marktext: "管",
						intro: {
							content: "expansion",
							markcount: "expansion",
						},
						charlotte: true,
						mod: {
							targetInRange(card, player, target) {
								if (target.hasSkill("chouxiang_fangguan")) return true; // “房管”角色对你使用牌无距离限制
							}
						},
						onremove(player) {
							player.unmarkSkill("chouxiang_fangguan_victim");
							delete player.storage.chouxiang_fangguan_victim;
						},
						trigger: { player: "phaseEnd" },
						async content(event, trigger, player) {
							const ottoPlayer = player.storage.chouxiang_fangguan_victim;
							if (!ottoPlayer) return; // 没有“房管”则不执行
							var list = [1, 2, 3, 4, 5];
							var list2 = list.slice();

							if (ottoPlayer.isHealthy()) {
								list2.remove(1); // 满血，移除选项一
							}

							// 检查是否有可对电棍使用的牌，否则移除选项二
							const usableCardsToOtto = player.getCards("h").filter(card => player.canUse(card, ottoPlayer, true, false));
							if (usableCardsToOtto.length === 0) {
								list2.remove(2);
							}

							// 如果没有坐骑牌， 移除选项三
							if (player.countCards("e", (card) => get.type(card) == "mount") == 0) {
								list2.remove(3);
							}
							// 如果没有牌， 移除选项四
							if (player.countCards("he") == 0) {
								list2.remove(4);
							}

							var choices = list2.map(i => {
								return "选项" + get.cnNumber(i, true);
							});
							var choiceList = ["令电棍回复一点体力，并获得房管牌", "对其使用一张牌，并弃置房管牌", "弃置一张坐骑牌", "交给其一张牌", "失去一点体力"].map((text, ind) => {
								if (list2.includes(ind + 1)) {
									return text;
								}
								return '<span style="opacity:0.5">' + text + "</span>";
							});

							const playerChoice = await player
								.chooseControl(choices)
								.set("choiceList", choiceList)
								.set("prompt", get.prompt("chouxiang_fangguan_victim")).forResult();

							console.log(`Player ${player.name} chose:`, playerChoice);
							await player.popup(playerChoice.control); // 弹出选择结果
							switch (playerChoice.control) {
								case "选项一":
									await ottoPlayer.recover(); // 令电棍回复体力
									await player.gain(player.getExpansions("chouxiang_fangguan_victim"), "give", player, "bySelf"); // 获得房管牌
									await player.removeSkill("chouxiang_fangguan_victim");
									break;
								case "选项二":
									const cardUsed = await player.chooseToUse(function (card, player, event) {
										return player.canUse(card, ottoPlayer, true, false);
									}, "对电棍使用一张牌，否则失去一点体力").set("filterTarget", function (card, player, target) {
										return target == ottoPlayer; // 只能对电棍使用牌
									}).set("forced", true).forResultBool();

									if (cardUsed) {
										await player.discard(player.getExpansions("chouxiang_fangguan_victim")); // 弃置房管牌
										await player.removeSkill("chouxiang_fangguan_victim");
									}
									else {
										// 这里应该永远不会执行，因为如果没有牌可用，选项二会被移除
										await player.loseHp(1); // 失去一点体力
									}
									break;
								case "选项三":
									const mounts = player.getCards("e", (card) => get.type(card) == "mount");
									if (mounts.length > 0) {
										const mountCard = await player.chooseToDiscard(mounts, true, `请选择一张坐骑牌弃置`).forResultCards();
										if (mountCard.length > 0) {
											await player.discard(mountCard[0]); // 弃置坐骑牌
										}
									}
									break;
								case "选项四":
									const giveCard = await player.chooseCard("he", true, `请选择一张牌交给${ottoPlayer.name}`).forResultCards();
									if (giveCard.length > 0) {
										await player.give(giveCard[0], ottoPlayer); // 交给其一张牌
									}
									break;
								case "选项五":
									await player.loseHp(1); // 失去一点体力
									break;
								default:
									console.warn(`Unexpected choice: ${playerChoice.control}`); // 处理意外选择
									break;
							}
						},
					},
				},
				translate: {
					chouxiang_zuikui: "罪魁",
					chouxiang_zuikui_info: "锁定技，所有即将最终结算的伤害，来源均视为你。",
					chouxiang_dongying: "东瀛",
					chouxiang_dongying_info: "主公技，锁定技，非群雄势力角色响应你使用的【南蛮入侵】，需要额外打出一张杀。",
					chouxiang_test_manqin: "蛮侵",
					chouxiang_test_manqin_info: "【测试用】锁定技，回合开始时，获得一张南蛮入侵。",
					chouxiang_waao: "哇袄",
					chouxiang_waao_info: "隐匿技，锁定技，你登场时，所有角色随机重铸一张手牌。无手牌或弃置红桃牌的角色失去一点体力。你与所有角色的距离视为1直到你的第一个回合结束。",
					chouxiang_shuncong: "顺从",
					chouxiang_shuncong_info: "锁定技，体力小于等于1的角色对你使用牌时，你摸一张牌，但不能使用或打出手牌。",
					chouxiang_fangguan: "房管",
					chouxiang_fangguan_info: "其他角色使用牌指定你为目标后，若其没有“房管”，你可以摸两张牌，并将一张牌牌面向上至于其武将牌上，称为“房管”。有“房管”的角色对你使用牌无距离限制，你对有“房管”的角色使用牌无次数限制。一名角色的回合结束时，若其有“房管”，其选择一项：①令你回复一点体力，然后获得武将牌上的“房管”；②对你使用一张牌（需合法），然后弃置武将牌上的“房管”；③弃置一张坐骑牌；④交给你一张牌；⑤失去一点体力。",
					chouxiang_fangguan_victim: "房管",
				},
			},
			intro: "",
			author: "choumaker",
			diskURL: "",
			forumURL: "",
			version: "1.0",
		},
		files: { character: ["erenxiaochuan.jpg", "cx_otto.jpg"], card: [], skill: [], audio: [] },
		connect: false,
	};
}
