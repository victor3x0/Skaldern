const id = "GUD_EVENT_CLEAR_TD_COLLISION_SCRIPT";
const groups = ["Gud GBS Plugins", "Collision"];
const subGroups = {
    "Gud GBS Plugins": "TopDown Tile Collisions",
	"Collision": "TopDown Tile Collisions"
};
const name = "Clear TopDown Tile Collision Script";

const fields = [
	{
		key: "state",
		label: "Select Collision Type",
		type: "select",
		defaultValue: "0",
		options: [
			["0", "Solid - 0xF"],
			["1", "Collision Top - 0x1"],
			["2", "Collision Bottom - 0x2"],
			["3", "Collision Left - 0x4"],
			["4", "Collision Right - 0x8"],
			["5", "Ladder - 0x10"],
			["6", "Slope - 0x60"],
			["7", "Spare 8 - 0x80"],
			["8", "Spare 9 - 0x90"],
			["9", "Spare 10 - 0xA0"],
			["10", "Spare 11 - 0xB0"],
			["11", "Spare 12 - 0xC0"],
			["12", "Spare 13 - 0xD0"],
			["13", "Spare 14 - 0xE0"],
			["14", "Spare 15 - 0xF0"],
		],
		conditions: [
			{
				key: "clearType",
				ne: "3"
			}
		]
	},
	{
		key: "clearType",
		label: "Clear Script",
		type: "select",
		defaultValue: "0",
		options: [
			["0", "Clear On Collision & Collision Exit"],
			["1", "Clear On Collision"],
			["2", "Collision Exit"],
			["3", "Clear ALL Collision Scripts"],
		],
	},
];
	
const compile = (input, helpers) => {
	const {appendRaw, _addComment} = helpers;
	const stateNumber = `${input.state}`;
	const clearType = `${input.clearType}`;

	_addComment("Remove TopDown Tile Collision Script");
	appendRaw(`VM_PUSH_CONST ${clearType}`);
	appendRaw(`VM_PUSH_CONST ${stateNumber}`);
	appendRaw(`VM_CALL_NATIVE b_clear_td_collision_script, _clear_td_collision_script`);
	appendRaw(`VM_POP 2`);
};
	
module.exports = {
	id,
	name,
	groups,
	subGroups,
	fields,
	compile,
	allowedBeforeInitFade: true,
};