/*
 * Event Plugin: If Button Just Pressed (avec buffer de tolérance)
 *
 * Au lieu de détecter sur 1 frame exacte (trop strict), on utilise un buffer :
 * - Quand le bouton est just pressed → active le buffer pour N frames
 * - L'event est "true" pendant toute la fenêtre buffer
 * - Le buffer décrémente chaque frame jusqu'à 0
 *
 * Helpers confirmés dans scriptBuilder.ts / scriptBuilderBase.ts :
 *   _declareLocal, _getMemInt8, _rpn, _ifConst, _ifVariableConst,
 *   _setVariableConst (via variableSetToValue), getVariableAlias,
 *   _compilePath, _jump, _label, _addComment, _addNL, getNextLabel
 *
 * Variables engine :
 *   joy_pressed = frame_joy & ~last_joy (calculé chaque frame dans input_update)
 *
 * KEY_BITS (helpers.ts) :
 *   right=0x01, left=0x02, up=0x04, down=0x08
 *   a=0x10, b=0x20, select=0x40, start=0x80
 */

const id = "EVENT_IF_BUTTON_JUST_PRESSED";
const name = "If Button Just Pressed";
const groups = ["EVENT_GROUP_INPUT", "EVENT_GROUP_CONTROL_FLOW"];
const help = "Vrai pendant N frames après la pression du bouton (buffer de tolérance). Idéal pour les combinaisons de touches.";

const KEY_BITS = {
  right:  0x01,
  left:   0x02,
  up:     0x04,
  down:   0x08,
  a:      0x10,
  b:      0x20,
  select: 0x40,
  start:  0x80,
};

const fields = [
  {
    key: "input",
    label: "Bouton",
    description: "Le bouton à surveiller.",
    type: "input",
    defaultValue: ["b"],
  },
  {
    key: "bufferVar",
    label: "Variable buffer",
    description: "Variable GBS dédiée qui stocke le compteur de tolérance. Initialise-la à 0 au On Init de la scène. Une variable par bouton surveillé.",
    type: "variable",
    defaultValue: "LAST_VARIABLE",
  },
  {
    key: "bufferFrames",
    label: "Fenêtre de tolérance (frames)",
    description: "Nombre de frames pendant lesquelles l'event reste 'true' après la pression. 8 frames ≈ 130ms, idéal pour les combos.",
    type: "number",
    min: 1,
    max: 30,
    defaultValue: 8,
  },
  {
    key: "true",
    label: "Just Pressed ✓",
    description: "Exécuté si le bouton a été pressé dans la fenêtre de tolérance.",
    type: "events",
  },
  {
    key: "__collapseElse",
    label: "Sinon",
    type: "collapsable",
    defaultValue: true,
  },
  {
    key: "false",
    label: "Sinon",
    description: "Exécuté si le bouton n'a pas été pressé récemment.",
    conditions: [{ key: "__collapseElse", ne: true }],
    type: "events",
  },
];

const compile = (input, helpers) => {
  const {
    _declareLocal,
    _getMemInt8,
    _rpn,
    _ifConst,
    _ifVariableConst,
    _setVariableConst,
    getVariableAlias,
    _compilePath,
    _jump,
    _label,
    _addComment,
    _addNL,
    getNextLabel,
  } = helpers;

  // Masque du/des bouton(s)
  const inputList = Array.isArray(input.input) ? input.input : [input.input];
  let mask = 0;
  for (const btn of inputList) {
    mask |= KEY_BITS[btn] || 0;
  }
  if (mask === 0) mask = 0xFF;

  const bufferFrames = input.bufferFrames || 8;
  const bufferVar    = input.bufferVar;
  const truePath     = input.true  || [];
  const falsePath    = input.false || [];

  const justPressedLabel = getNextLabel(); // just pressed ce frame → recharge buffer
  const checkBufferLabel = getNextLabel(); // vérifie si buffer > 0
  const trueLabel        = getNextLabel(); // branche true
  const endLabel         = getNextLabel();

  _addComment(`If Button Just Pressed (buffer: ${bufferFrames} frames)`);

  // --- Étape 1 : lire joy_pressed et tester le bouton ---
  const inputRef = _declareLocal("joy_pressed_val", 1, true);
  _getMemInt8(inputRef, "_joy_pressed");

  _rpn()
    .ref(inputRef)
    .int8(mask)
    .operator(".B_AND")
    .stop();

  // Si just pressed ce frame → recharge le buffer et va à true
  _ifConst(".NE", ".ARG0", 0, justPressedLabel, 1);

  // --- Étape 2 : pas just pressed ce frame, vérifie le buffer ---
  _addComment("-- Check buffer");
  _ifVariableConst(".GT", bufferVar, 0, checkBufferLabel, 0);

  // Buffer vide et pas just pressed → false
  _compilePath(falsePath);
  _jump(endLabel);

  // Buffer encore actif → true + décrémente
  _label(checkBufferLabel);
  _addComment("-- Buffer active: decrement");

  // bufferVar -= 1  via RPN
  _rpn()
    .refVariable(bufferVar)
    .int8(1)
    .operator(".SUB")
    .refSetVariable(bufferVar)
    .stop();

  _compilePath(truePath);
  _jump(endLabel);

  // --- Étape 3 : just pressed ce frame → recharge buffer + true ---
  _label(justPressedLabel);
  _addComment("-- Just pressed: reload buffer");
  _setVariableConst(bufferVar, bufferFrames);
  _compilePath(truePath);

  _label(endLabel);
  _addNL();
};

module.exports = {
  id,
  name,
  groups,
  help,
  fields,
  compile,
};
