import { type ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { type MoveInfo } from "~/api/dataExtraction/extractMoveInfo";
import { typeColors } from "~/ui/colors";
import { moveEmojis } from "~/ui/emojis";
import { calculateTRPrice } from "~/utility/calculators/tr-price-calculator";
import moveModifiersJson from "../../../public/json/move_modifiers.json";
import { formatUserInput } from "~/utility/formatting/formatUserInput";

interface MoveModifier {
  meta?: Partial<MoveInfo["meta"]>;
  stat_changes?: MoveInfo["stat_changes"];
}

const MOVE_MODIFIERS: Record<string, MoveModifier> =
  moveModifiersJson as Record<string, MoveModifier>;

function applyMoveModifiers(move: MoveInfo): MoveInfo {
  const modifier = MOVE_MODIFIERS[formatUserInput(move.name)];

  console.log("Move:", formatUserInput(move.name));
  console.log("Modifier:", modifier);

  if (!modifier) {
    return move;
  }

  return {
    ...move,

    meta: {
      ...move.meta,
      ...(modifier.meta ?? {}),
    },

    stat_changes: modifier.stat_changes ?? move.stat_changes,
  };
}

export const createTRPriceEmbed = (
  interaction: ChatInputCommandInteraction,
  moveInfo: MoveInfo,
) => {
  const modifiedMove = applyMoveModifiers(moveInfo);
  const trPrice = calculateTRPrice(modifiedMove);
  const breakdown = trPrice.breakdown;

  const costFields = [
    ["Base Cost", breakdown.base],
    ["Power", breakdown.power],
    ["Accuracy", breakdown.accuracy],
    ["Status", breakdown.status],
    ["Flinch", breakdown.flinch],
    ["Stats", breakdown.stats],
    ["Multi Stat", breakdown.multi_stat],
    ["Multi Hit", breakdown.multi_hit],
    ["Recovery", breakdown.recovery],
    ["Unique", breakdown.unique],
    ["Priority", breakdown.priority],
    ["Target", breakdown.target],
    ["Crit", breakdown.crit],
  ].filter(([_, value]) => Number(value) > 0);

  const embed = new EmbedBuilder()
    .setColor(typeColors[moveInfo.type] || typeColors.normal)
    .setTitle(`${moveEmojis[moveInfo.damage_class] ?? "❓"} ${moveInfo.name}`)
    .setDescription(
      [
        moveInfo.flavor_text.replace(/\r?\n|\r/g, " "),
        "",
        `**Type:** ${moveInfo.type}`,
        `**Category:** ${moveInfo.damage_class}`,
      ].join("\n"),
    )
    .addFields(
      {
        name: "💰 Market Price",
        value: `**₽${trPrice.rounded.toLocaleString()}**`,
        inline: true,
      },
      {
        name: "🧮 Raw Value",
        value: `₽${trPrice.total.toLocaleString()}`,
        inline: true,
      },
      {
        name: "📊 Price Factors",
        value:
          costFields
            .map(
              ([name, value]) => `${name}: +₽${Number(value).toLocaleString()}`,
            )
            .join("\n") || "No modifiers",
      },
    )
    .setFooter({
      text: `Requested by ${interaction.user.username} • Powered by PokeAPI`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  return embed;
};
