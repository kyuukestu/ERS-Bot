# ERS-Bot Commands Documentation

This documentation provides a complete reference of all available commands in the ERS-Bot. Commands are organized by category and include usage examples.

---

## 📖 Table of Contents

1. [Pokédex Commands](#-pokedex-commands)
2. [Damage Calculator](#️-damage-calculator)
3. [PokeSync Commands](#-pokesync-commands)
4. [Info Commands](#info-commands)

---

## 🔍 Pokedex Commands

Pokédex commands provide detailed information about Pokémon, moves, items, abilities, and type effectiveness from the official Pokémon database.

### `/pokedex`

**Description:** Displays detailed information about a Pokémon with stats, abilities, moves, and a visual card.

**Usage:** `/pokedex pokemon:<name>`

**Parameters:**

- `pokemon` (required, string): The name of the Pokémon to look up (e.g., "Pikachu", "Charizard")

**Example:** `/pokedex pokemon:Charizard`

**Output:** Visual card with Pokémon stats, typing, abilities, and moves.

---

### `/dex-pokemon`

**Description:** Provides comprehensive Pokédex-style information about a Pokémon, including multiple forms and variants.

**Usage:** `/dex-pokemon name:<pokemon> [form:<form>] [shiny:<true/false>]`

**Parameters:**

- `name` (required, string): The Pokémon species name
- `form` (optional, string): Specific form variant (e.g., "alolan", "galar", "hisuian")
- `shiny` (optional, boolean): Display the shiny variant by default

**Examples:**

- `/dex-pokemon name:Pikachu`
- `/dex-pokemon name:Raichu form:alolan`
- `/dex-pokemon name:Gyarados shiny:true`

**Output:** Interactive embed with stats, abilities, moves, and form selector.

---

### `/dex-moves`

**Description:** Provides detailed information about a Pokémon move, including type, power, accuracy, and which Pokémon can learn it.

**Usage:** `/dex-moves move:<move_name>`

**Parameters:**

- `move` (required, string): The name of the move (e.g., "Thunderbolt", "Psychic", "Dragon Dance")

**Examples:**

- `/dex-moves move:Thunderbolt`
- `/dex-moves move:Earthquake`

**Output:** Embed showing move properties (type, category, power, accuracy, PP) and paginated list of Pokémon that learn it.

---

### `/dex-abilities`

**Description:** Shows information about a Pokémon ability, its effect, and which Pokémon have this ability.

**Usage:** `/dex-abilities ability:<ability_name>`

**Parameters:**

- `ability` (required, string): The ability name (e.g., "Speed Boost", "Intimidate", "Huge Power")

**Examples:**

- `/dex-abilities ability:Intimidate`
- `/dex-abilities ability:Speed Boost`

**Output:** Embed with ability description and paginated list of Pokémon with this ability.

---

### `/dex-items`

**Description:** Provides information about a Pokémon item, including its category, effect, cost, and fling properties.

**Usage:** `/dex-items item:<item_name>`

**Parameters:**

- `item` (required, string): The item name (e.g., "Flame Orb", "Pinap Berry", "Thunder Stone")

**Examples:**

- `/dex-items item:Flame Orb`
- `/dex-items item:Master Ball`

**Output:** Embed with item details including category, cost, effect, and fling data.

---

### `/dex-learn-set`

**Description:** Shows all the moves that a Pokémon can learn, organized by learning method (level-up, machine, tutor, breeding, other).

**Usage:** `/dex-learn-set name:<pokemon> [form:<form>]`

**Parameters:**

- `name` (required, string): The Pokémon species name
- `form` (optional, string): Specific form variant (e.g., "alolan", "galar")

**Examples:**

- `/dex-learn-set name:Pikachu`
- `/dex-learn-set name:Charizard form:galar`

**Output:** Interactive tabs showing moves organized by learning method with level requirements and game versions.

---

### `/dex-type-effectiveness`

**Description:** Displays type effectiveness match-ups for one to three Pokémon types combined, showing strengths and weaknesses.

**Usage:** `/dex-type-effectiveness type-1:<type> [type-2:<type>] [type-3:<type>]`

**Parameters:**

- `type-1` (required, string): Primary type
- `type-2` (optional, string): Secondary type
- `type-3` (optional, string): Tertiary type

**Types:** Normal, Fire, Water, Electric, Grass, Ice, Fighting, Poison, Ground, Flying, Psychic, Bug, Rock, Ghost, Dragon, Dark, Steel, Fairy

**Examples:**

- `/dex-type-effectiveness type-1:Fire`
- `/dex-type-effectiveness type-1:Water type-2:Ground`
- `/dex-type-effectiveness type-1:Steel type-2:Flying type-3:Fairy`

**Output:** Visual chart showing super-effective, not-very-effective, and immune match-ups.

---

## ⚔️ Damage Calculator

### `/damage-calc`

**Description:** An advanced Pokémon damage calculator using Smogon's calculation system. Calculate damage outputs for battles with detailed move effects.

**Usage:** `/damage-calc [options]`

**Features:**

- Select generation, format, and game conditions
- Configure attacker and defender Pokémon with stats, abilities, items, natures, and status
- Add move effects (secondary effects, stat changes, field effects)
- Calculate damage ranges with accuracy percentages
- Support for weather, terrain, and field conditions

**Parameters:**
Multiple interactive options including:

- **Generation**: Gen 1-9
- **Format**: Various competitive formats
- **Move**: Attack move to use
- **Pokémon**: Species, level, ability, nature, item, moves, stats
- **Conditions**: Weather, terrain, field effects, boosts

**Output:** Detailed damage report showing:

- Damage range and KO percentage
- Critical hit damage
- Accuracy information
- Detailed breakdown of damage calculation

---

## 🎮 PokeSync Commands

PokeSync commands are specialized for the Pokémon Sync RPG system, including character management, battles, and resource calculations.

### Character Management

#### `/sync-register-oc`

**Description:** Register a new Original Character (OC) to the database for PokeSync.

**Usage:** `/sync-register-oc name:<name> [nickname:<nickname>]`

**Parameters:**

- `name` (required, string): Official name of your OC
- `nickname` (optional, string): Display nickname (defaults to name if not provided)

**Example:** `/sync-register-oc name:Ash nickname:The Trainer`

**Output:** Confirmation of OC registration.

---

#### `/sync-show-party`

**Description:** Display your OC's current Pokémon party with stats and move-sets.

**Usage:** `/sync-show-party oc-name:<name>`

**Parameters:**

- `oc-name` (required, string): Your registered OC's name

**Example:** `/sync-show-party oc-name:Ash`

**Output:** Formatted display of all Pokémon in the party with levels, stats, and abilities.

---

### Pokémon Management

#### `/sync-add-pokemon`

**Description:** Add a Pokémon to your OC's team or box.

**Usage:** `/sync-add-pokemon oc-name:<name> pokemon:<species> level:<level> [form:<form>] [alpha:<true/false>] [in-box:<true/false>] [additional-abilities:<count>]`

**Parameters:**

- `oc-name` (required, string): Your registered OC's name
- `pokemon` (required, string): Pokémon species name
- `level` (required, integer): Pokémon level (1-100)
- `form` (optional, string): Regional form variant (e.g., "alolan", "galar")
- `alpha` (optional, boolean): Is this an alpha Pokémon? (increases size/stats)
- `in-box` (optional, boolean): Add to box instead of party (default: false)
- `additional-abilities` (optional, integer): Number of bonus ability slots

**Example:** `/sync-add-pokemon oc-name:Ash pokemon:Pikachu level:50`

**Output:** Confirmation with calculated Fortitude drain and Pokémon stats.

---

#### `/sync-update-pokemon`

**Description:** Update an existing Pokémon's stats, level, or other properties.

**Usage:** `/sync-update-pokemon oc-name:<name> poke-nickname:<nickname> [level:<level>] [alpha:<true/false>]`

**Parameters:**

- `oc-name` (required, string): Your OC's name
- `poke-nickname` (required, string): Current Pokémon nickname
- `level` (optional, integer): New level (1-100)
- `alpha` (optional, boolean): Toggle alpha status

**Example:** `/sync-update-pokemon oc-name:Ash poke-nickname:Pikachu level:75`

**Output:** Updated Pokémon stats and Fortitude drain.

---

#### `/sync-remove-pokemon`

**Description:** Remove a Pokémon from your party or box.

**Usage:** `/sync-remove-pokemon oc-name:<name> poke-nickname:<nickname> [in-box:<true/false>]`

**Parameters:**

- `oc-name` (required, string): Your OC's name
- `poke-nickname` (required, string): Pokémon to remove
- `in-box` (optional, boolean): Remove from box instead of party (default: false)

**Example:** `/sync-remove-pokemon oc-name:Ash poke-nickname:Pikachu`

**Output:** Confirmation of Pokémon removal.

---

#### `/sync-add-moves`

**Description:** Add moves to a Pokémon. Moves should be comma-separated.

**Usage:** `/sync-add-moves oc-name:<name> poke-nickname:<nickname> moves:<move1,move2,...> [in-box:<true/false>]`

**Parameters:**

- `oc-name` (required, string): Your OC's name
- `poke-nickname` (required, string): Target Pokémon nickname
- `moves` (required, string): Comma-separated list of move names
- `in-box` (optional, boolean): Update Pokémon in box (default: false)

**Example:** `/sync-add-moves oc-name:Ash poke-nickname:Pikachu moves:Thunderbolt,Quick Attack,Iron Tail`

**Output:** Confirmation of moves added.

---

#### `/sync-show-moves`

**Description:** Display all moves on a specific Pokémon.

**Usage:** `/sync-show-moves oc-name:<name> poke-nickname:<nickname> [in-box:<true/false>]`

**Parameters:**

- `oc-name` (required, string): Your OC's name
- `poke-nickname` (required, string): Pokémon to check
- `in-box` (optional, boolean): Check Pokémon in box (default: false)

**Example:** `/sync-show-moves oc-name:Ash poke-nickname:Pikachu`

**Output:** List of moves on the Pokémon.

---

### Inventory & Item Management

#### `/sync-show-inv`

**Description:** Display your OC's inventory and held items.

**Usage:** `/sync-show-inv oc-name:<name>`

**Parameters:**

- `oc-name` (required, string): Your OC's name

**Example:** `/sync-show-inv oc-name:Ash`

**Output:** Paginated inventory display with item counts and values.

---

#### `/sync-transaction`

**Description:** Perform monetary transactions and modify inventory (buy, sell, add, remove items, or trade).

**Usage:** `/sync-transaction oc-name:<name> action:<action> rp-date:<date> [item-name:<item>] [quantity:<amount>] [target-oc:<name>]`

**Parameters:**

- `oc-name` (required, string): Your OC's name
- `action` (required, choice): Add, Remove, Delete, Buy, Sell, Trade
- `rp-date` (required, string): In-game date of transaction
- `item-name` (optional, string): Item name (required for item actions)
- `quantity` (optional, integer): Quantity of item
- `target-oc` (optional, string): For trades, the other OC's name

**Examples:**

- `/sync-transaction oc-name:Ash action:BUY rp-date:2024-01-15 item-name:Pokéball quantity:10`
- `/sync-transaction oc-name:Ash action:SELL rp-date:2024-01-15 item-name:Potion quantity:5`

**Output:** Transaction confirmation with updated inventory and currency.

---

### Calculators

#### `/sync-move-drain`

**Description:** Calculate the Fortitude drain (cost) of using a specific move in battle.

**Usage:** `/sync-move-drain move:<move_name> [sec-override:<value>] [stat-override:<value>] [field-override:<value>]`

**Parameters:**

- `move` (required, string): The move name
- `sec-override` (optional, number): Secondary effect modifier (e.g., +1 for burn/freeze/crit chance)
- `stat-override` (optional, number): Stat change modifier (+positive for user benefits, -negative for foe benefits)
- `field-override` (optional, number): Field effect modifier (e.g., Trick Room, hazards)

**Examples:**

- `/sync-move-drain move:Thunderbolt`
- `/sync-move-drain move:Dragon Dance stat-override:1`

**Output:** Drain cost with detailed breakdown.

---

#### `/sync-poke-drain`

**Description:** Calculate passive Fortitude drain (upkeep) for maintaining a Pokémon on your team.

**Usage:** `/sync-poke-drain pokemon:<species> level:<level> [form:<form>] [alpha:<true/false>]`

**Parameters:**

- `pokemon` (required, string): Pokémon species
- `level` (required, integer): Pokémon level (1-100)
- `form` (optional, string): Regional form
- `alpha` (optional, boolean): Is it an alpha Pokémon?

**Examples:**

- `/sync-poke-drain pokemon:Pikachu level:50`
- `/sync-poke-drain pokemon:Charizard level:75 form:galar`

**Output:** Hourly/daily upkeep cost.

---

#### `/sync-tr-price`

**Description:** Calculate the cost to purchase a move from the PokeStore using Technical Records.

**Usage:** `/sync-tr-price move-name:<move> [sec-override:<value>] [stat-override:<value>] [field-override:<value>]`

**Parameters:**

- `move-name` (required, string): The move name
- `sec-override` (optional, number): Secondary effect modifier
- `stat-override` (optional, number): Stat change modifier
- `field-override` (optional, number): Field effect modifier

**Examples:**

- `/sync-tr-price move-name:Thunderbolt`
- `/sync-tr-price move-name:Swordsdance stat-override:1`

**Output:** Purchase price in Pokédollars.

---

#### `/sync-fortitude-pool`

**Description:** Calculate your total Fortitude Pool based on your rank and sub-rank in PokeSync.

**Usage:** `/sync-fortitude-pool rank:<rank> [sub-rank:<sub_rank>]`

**Parameters:**

- `rank` (required, choice): Bronze, Silver, Gold, Platinum, Master, High Master, Grand Master
- `sub-rank` (optional, integer): Sub-rank level (1-10 depending on rank)

**Examples:**

- `/sync-fortitude-pool rank:Silver`
- `/sync-fortitude-pool rank:Master sub-rank:5`

**Output:** Total Fortitude Pool available.

---

#### `/sync-catch-roll`

**Description:** Simulate a Pokémon catch using various Pokéballs and conditions. Supports multiple roll attempts.

**Usage:** `/sync-catch-roll pokemon:<species> pokeball:<ball_type> [health:<hp_percentage>] [status:<status>] [attempts:<count>]`

**Parameters:**

- `pokemon` (required, string): Species to catch
- `pokeball` (required, choice): Type of Pokéball (Ultra, Great, Master, etc.)
- `health` (optional, integer): Current HP percentage (0-100)
- `status` (optional, choice): Pokémon status (paralysis, burn, sleep, etc.)
- `attempts` (optional, integer): Number of roll attempts

**Examples:**

- `/sync-catch-roll pokemon:Charizard pokeball:Ultra health:25`
- `/sync-catch-roll pokemon:Pikachu pokeball:Master attempts:5`

**Output:** Catch result(s) with success probability and roll details.

---

#### `/sync-pick-up-proc`

**Description:** Simulate the Pick Up ability to randomly obtain an item based on Pokémon level.

**Usage:** `/sync-pick-up-proc level:<level>`

**Parameters:**

- `level` (required, integer): Pokémon level (1-100)

**Example:** `/sync-pick-up-proc level:50`

**Output:** Random item obtained (or nothing) based on level-dependent drop table.

---

#### `/sync-rand-underground-encounter`

**Description:** Roll a random Pokémon encounter from the Sinnoh Grand Underground with visual map.

**Usage:** `/sync-rand-underground-encounter`

**Parameters:** None

**Output:** Random encounter displayed on Grand Underground map.

---

## Info Commands

### `/info-commands`

**Description:** Displays a comprehensive list of all available bot commands with brief descriptions.

**Usage:** `/info-commands`

**Parameters:** None

**Output:** Categorized command list with descriptions and basic usage.

---

### `/info-restricted`

**Description:** Shows a list of Pokémon, moves, and abilities that are restricted or banned in competitive formats and PokeSync rules.

**Usage:** `/info-restricted [search:<query>]`

**Parameters:**

- `search` (optional, string): Search for specific restricted items (Pokémon, moves, or abilities)

**Examples:**

- `/info-restricted`
- `/info-restricted search:Koraidon`

**Output:** List of restricted/banned content organized by type and group.

---
