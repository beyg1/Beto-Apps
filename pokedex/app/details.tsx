// ============================================================================
// IMPORTS - React Native, Expo Router, and Animation Components
// ============================================================================

import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default: string | null;
  back_shiny: string | null;
  other: {
    "official-artwork": {
      front_default: string | null;
    };
    dream_world: {
      front_default: string | null;
    };
  };
}

interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  sprites: PokemonSprites;
  location_area_encounters: string;
}

interface PokemonSpecies {
  habitat: {
    name: string;
    url: string;
  } | null;
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
    };
  }[];
  genera: {
    genus: string;
    language: {
      name: string;
    };
  }[];
}

// ============================================================================
// THEME CONSTANTS
// ============================================================================

const typeGradients: Record<string, [string, string, string]> = {
  normal: ["#A8A878", "#8A8A59", "#6D6D3F"],
  fire: ["#FF6B35", "#F7931A", "#E85D04"],
  water: ["#4FC3F7", "#0288D1", "#01579B"],
  electric: ["#FFD54F", "#FF8F00", "#E65100"],
  grass: ["#66BB6A", "#2E7D32", "#1B5E20"],
  ice: ["#80DEEA", "#4DD0E1", "#00ACC1"],
  fighting: ["#EF5350", "#C62828", "#B71C1C"],
  poison: ["#BA68C8", "#7B1FA2", "#4A148C"],
  ground: ["#FFCC80", "#E65100", "#BF360C"],
  flying: ["#CE93D8", "#9575CD", "#7E57C2"],
  psychic: ["#FF6B9D", "#BA68C8", "#8E24AA"],
  bug: ["#AED581", "#7CB342", "#558B2F"],
  rock: ["#BCAAA4", "#8D6E63", "#5D4037"],
  ghost: ["#7C4DFF", "#4527A0", "#311B92"],
  dragon: ["#7C4DFF", "#536DFE", "#304FFE"],
  dark: ["#78909C", "#455A64", "#263238"],
  steel: ["#B0BEC5", "#78909C", "#546E7A"],
  fairy: ["#F48FB1", "#EC407A", "#C2185B"],
};

const statNames: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

const statIcons: Record<string, string> = {
  hp: "❤️",
  attack: "⚔️",
  defense: "🛡️",
  "special-attack": "✨",
  "special-defense": "🔮",
  speed: "⚡",
};

// ============================================================================
// HERO IMAGE COMPONENT (entrance animation only, no continuous animation)
// ============================================================================

function HeroImage({ uri }: { uri: string }) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Image source={{ uri }} style={styles.mainImage} resizeMode="contain" />
    </Animated.View>
  );
}

// ============================================================================
// ANIMATED STAT BAR COMPONENT (triggers on visibility)
// ============================================================================

interface StatBarProps {
  stat: PokemonStat;
  index: number;
  maxStat: number;
  isVisible: boolean;
}

function AnimatedStatBar({ stat, index, maxStat, isVisible }: StatBarProps) {
  const progress = useSharedValue(0);
  const hasAnimated = useSharedValue(false);

  useEffect(() => {
    // Only animate once when becoming visible
    if (isVisible && !hasAnimated.value) {
      hasAnimated.value = true;
      progress.value = withDelay(
        index * 100 + 1000, // Added 1s delay
        withTiming(stat.base_stat / maxStat, {
          duration: 800,
          easing: Easing.out(Easing.cubic),
        })
      );
    }
  }, [isVisible, stat.base_stat, maxStat]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const getStatColor = (value: number) => {
    if (value >= 120) return "#00C853";
    if (value >= 90) return "#4CAF50";
    if (value >= 60) return "#FFC107";
    if (value >= 40) return "#FF9800";
    return "#F44336";
  };

  return (
    <View style={styles.statItem}>
      <View style={styles.statHeader}>
        <Text style={styles.statIcon}>{statIcons[stat.stat.name] || "📊"}</Text>
        <Text style={styles.statName}>
          {statNames[stat.stat.name] || stat.stat.name}
        </Text>
        <Text
          style={[styles.statValue, { color: getStatColor(stat.base_stat) }]}
        >
          {stat.base_stat}
        </Text>
      </View>
      <View style={styles.statBarContainer}>
        <Animated.View
          style={[
            styles.statBarFill,
            animatedBarStyle,
            { backgroundColor: getStatColor(stat.base_stat) },
          ]}
        />
      </View>
    </View>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Details() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  // Refs for scroll-based visibility detection
  const statsYPosition = useRef<number>(0);
  const screenHeight = Dimensions.get("window").height;

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (statsVisible) return; // Already visible, no need to check

      const scrollY = event.nativeEvent.contentOffset.y;
      const viewportBottom = scrollY + screenHeight;

      // Trigger animation when stats section enters viewport
      if (
        statsYPosition.current > 0 &&
        viewportBottom > statsYPosition.current + 100
      ) {
        setStatsVisible(true);
      }
    },
    [statsVisible, screenHeight]
  );

  useEffect(() => {
    if (params.name) {
      fetchDetails(params.name as string);
    }
  }, [params.name]);

  async function fetchDetails(name: string) {
    try {
      setLoading(true);
      setError(null);

      const pokemonResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${name}`
      );
      if (!pokemonResponse.ok) {
        throw new Error(`Failed to fetch Pokemon: ${pokemonResponse.status}`);
      }
      const pokemonData = await pokemonResponse.json();
      setPokemon(pokemonData);

      const speciesResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${name}`
      );
      if (!speciesResponse.ok) {
        throw new Error(`Failed to fetch species: ${speciesResponse.status}`);
      }
      const speciesData = await speciesResponse.json();
      setSpecies(speciesData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch Pokemon details"
      );
      console.error("Error fetching Pokemon details:", err);
    } finally {
      setLoading(false);
    }
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getFlavorText = () => {
    if (!species?.flavor_text_entries) return "";
    const englishEntry = species.flavor_text_entries.find(
      (entry) => entry.language.name === "en"
    );
    return englishEntry
      ? englishEntry.flavor_text.replace(/\f/g, " ").replace(/\n/g, " ")
      : "";
  };

  const getGenus = () => {
    if (!species?.genera) return "";
    const englishGenus = species.genera.find((g) => g.language.name === "en");
    return englishGenus ? englishGenus.genus : "";
  };

  const getGradientColors = (): [string, string, string] => {
    if (!pokemon?.types.length) return ["#68A090", "#4A7C6F", "#3D6B5F"];
    const primaryType = pokemon.types[0].type.name;
    return typeGradients[primaryType] || ["#68A090", "#4A7C6F", "#3D6B5F"];
  };

  const getMaxStat = () => {
    if (!pokemon) return 200;
    return Math.max(...pokemon.stats.map((s) => s.base_stat), 150);
  };

  const getTotalStats = () => {
    if (!pokemon) return 0;
    return pokemon.stats.reduce((acc, s) => acc + s.base_stat, 0);
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={["#0a0a14", "#12121f", "#1a1a30"]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color="#7C4DFF" />
        <Text style={styles.loadingText}>Loading Pokémon...</Text>
      </View>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error || !pokemon) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={["#0a0a14", "#12121f", "#1a1a30"]}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.errorEmoji}>😵</Text>
        <Text style={styles.errorText}>{error || "Pokemon not found"}</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  const formattedId = `#${pokemon.id.toString().padStart(3, "0")}`;
  const gradientColors = getGradientColors();

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={gradientColors}
        locations={[0, 0.5, 1]}
        style={styles.heroGradient}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={true}
        onScroll={handleScroll}
        scrollEventThrottle={100}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Decorative Background Elements */}
          <View style={styles.heroBgCircle1} />
          <View style={styles.heroBgCircle2} />

          {/* ID and Genus */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            style={styles.heroBadgesRow}
          >
            <View style={styles.idBadge}>
              <Text style={styles.idText}>{formattedId}</Text>
            </View>
            {getGenus() && (
              <View style={styles.genusBadge}>
                <Text style={styles.genusText}>{getGenus()}</Text>
              </View>
            )}
          </Animated.View>

          {/* Pokemon Name */}
          <Animated.Text
            entering={FadeInDown.delay(200).duration(500).springify()}
            style={styles.pokemonName}
          >
            {pokemon.name}
          </Animated.Text>

          {/* Types Row */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={styles.typesRow}
          >
            {pokemon.types.map((type, index) => (
              <View
                key={type.type.name}
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor:
                      typeGradients[type.type.name]?.[0] || "#68A090",
                  },
                ]}
              >
                <Text style={styles.typeText}>
                  {type.type.name.toUpperCase()}
                </Text>
              </View>
            ))}
          </Animated.View>

          {/* Main Pokemon Image */}
          <View style={styles.imageContainer}>
            <HeroImage
              uri={
                pokemon.sprites.other["official-artwork"].front_default ||
                pokemon.sprites.front_default ||
                ""
              }
            />
          </View>
        </View>

        {/* Content Card */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.contentCard}
        >
          {/* Description */}
          {getFlavorText() && (
            <Animated.View
              entering={FadeIn.delay(400).duration(400)}
              style={styles.descriptionSection}
            >
              <Text style={styles.description}>"{getFlavorText()}"</Text>
            </Animated.View>
          )}

          {/* Physical Characteristics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.physicalRow}>
              <View style={styles.physicalItem}>
                <View style={styles.physicalIconContainer}>
                  <Text style={styles.physicalIcon}>📏</Text>
                </View>
                <Text style={styles.physicalValue}>
                  {(pokemon.height / 10).toFixed(1)} m
                </Text>
                <Text style={styles.physicalLabel}>Height</Text>
              </View>
              <View style={styles.physicalDivider} />
              <View style={styles.physicalItem}>
                <View style={styles.physicalIconContainer}>
                  <Text style={styles.physicalIcon}>⚖️</Text>
                </View>
                <Text style={styles.physicalValue}>
                  {(pokemon.weight / 10).toFixed(1)} kg
                </Text>
                <Text style={styles.physicalLabel}>Weight</Text>
              </View>
              <View style={styles.physicalDivider} />
              <View style={styles.physicalItem}>
                <View style={styles.physicalIconContainer}>
                  <Text style={styles.physicalIcon}>⭐</Text>
                </View>
                <Text style={styles.physicalValue}>
                  {pokemon.base_experience || "N/A"}
                </Text>
                <Text style={styles.physicalLabel}>Base XP</Text>
              </View>
            </View>
          </View>

          {/* Abilities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Abilities</Text>
            <View style={styles.abilitiesContainer}>
              {pokemon.abilities.map((ability, index) => (
                <Animated.View
                  key={ability.ability.name}
                  entering={ZoomIn.delay(index * 100 + 500).duration(300)}
                  style={[
                    styles.abilityBadge,
                    ability.is_hidden && styles.hiddenAbilityBadge,
                  ]}
                >
                  <Text style={styles.abilityText}>
                    {ability.ability.name
                      .replace(/-/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Text>
                  {ability.is_hidden && (
                    <View style={styles.hiddenTag}>
                      <Text style={styles.hiddenTagText}>Hidden</Text>
                    </View>
                  )}
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Base Stats */}
          <View
            style={styles.section}
            onLayout={(event) => {
              const layout = event.nativeEvent.layout;
              statsYPosition.current = layout.y;
            }}
          >
            <View style={styles.statsTitleRow}>
              <Text style={styles.sectionTitle}>Base Stats</Text>
              <View style={styles.totalStatsBadge}>
                <Text style={styles.totalStatsText}>
                  Total: {getTotalStats()}
                </Text>
              </View>
            </View>
            {pokemon.stats.map((stat, index) => (
              <AnimatedStatBar
                key={stat.stat.name}
                stat={stat}
                index={index}
                maxStat={getMaxStat()}
                isVisible={statsVisible}
              />
            ))}
          </View>

          {/* Sprites Gallery */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gallery</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.spritesScroll}
            >
              {pokemon.sprites.front_default && (
                <Animated.View
                  entering={ZoomIn.delay(600).duration(300)}
                  style={styles.spriteCard}
                >
                  <Image
                    source={{ uri: pokemon.sprites.front_default }}
                    style={styles.spriteImage}
                  />
                  <Text style={styles.spriteLabel}>Normal</Text>
                </Animated.View>
              )}
              {pokemon.sprites.front_shiny && (
                <Animated.View
                  entering={ZoomIn.delay(700).duration(300)}
                  style={[styles.spriteCard, styles.shinyCard]}
                >
                  <View style={styles.shinyBadge}>
                    <Text style={styles.shinyBadgeText}>✨</Text>
                  </View>
                  <Image
                    source={{ uri: pokemon.sprites.front_shiny }}
                    style={styles.spriteImage}
                  />
                  <Text style={styles.spriteLabel}>Shiny</Text>
                </Animated.View>
              )}
              {pokemon.sprites.back_default && (
                <Animated.View
                  entering={ZoomIn.delay(800).duration(300)}
                  style={styles.spriteCard}
                >
                  <Image
                    source={{ uri: pokemon.sprites.back_default }}
                    style={styles.spriteImage}
                  />
                  <Text style={styles.spriteLabel}>Back</Text>
                </Animated.View>
              )}
              {pokemon.sprites.back_shiny && (
                <Animated.View
                  entering={ZoomIn.delay(900).duration(300)}
                  style={[styles.spriteCard, styles.shinyCard]}
                >
                  <View style={styles.shinyBadge}>
                    <Text style={styles.shinyBadgeText}>✨</Text>
                  </View>
                  <Image
                    source={{ uri: pokemon.sprites.back_shiny }}
                    style={styles.spriteImage}
                  />
                  <Text style={styles.spriteLabel}>Shiny Back</Text>
                </Animated.View>
              )}
            </ScrollView>
          </View>

          {/* Habitat */}
          {species?.habitat && (
            <Animated.View
              entering={FadeInUp.delay(700).duration(400)}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>Habitat</Text>
              <View style={styles.habitatCard}>
                <Text style={styles.habitatIcon}>🌍</Text>
                <Text style={styles.habitatText}>
                  {species.habitat.name.replace(/\b\w/g, (l) =>
                    l.toUpperCase()
                  )}
                </Text>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLESHEET
// ============================================================================

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#0a0a14",
  },

  heroGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 450,
  },

  container: {
    paddingBottom: 40,
  },

  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a14",
  },

  loadingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    marginTop: 16,
    fontWeight: "600",
  },

  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },

  errorText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    padding: 20,
  },

  backButton: {
    backgroundColor: "#7C4DFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 16,
  },

  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  // Hero Section
  heroSection: {
    alignItems: "center",
    paddingTop: 90,
    paddingBottom: 30,
    paddingHorizontal: 24,
    position: "relative",
    overflow: "hidden",
  },

  heroBgCircle1: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  heroBgCircle2: {
    position: "absolute",
    bottom: 50,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  heroBadgesRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },

  idBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  idText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 2,
  },

  genusBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  genusText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    fontStyle: "italic",
  },

  pokemonName: {
    fontSize: 46,
    fontWeight: "900",
    color: "#fff",
    textTransform: "capitalize",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },

  typesRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },

  typeBadge: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  typeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  imageContainer: {
    marginTop: 20,
    marginBottom: -50,
    zIndex: 10,
  },

  mainImage: {
    width: 300,
    height: 300,
  },

  // Content Card
  contentCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: 20,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },

  // Description
  descriptionSection: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },

  description: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
    fontStyle: "italic",
    textAlign: "center",
  },

  // Sections
  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 16,
    letterSpacing: 0.5,
  },

  // Physical Info
  physicalRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 24,
    padding: 24,
  },

  physicalItem: {
    alignItems: "center",
    flex: 1,
  },

  physicalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  physicalIcon: {
    fontSize: 22,
  },

  physicalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a2e",
  },

  physicalLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  physicalDivider: {
    width: 1,
    height: 60,
    backgroundColor: "#e0e0e0",
  },

  // Abilities
  abilitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  abilityBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  hiddenAbilityBadge: {
    backgroundColor: "#fff8e1",
    borderWidth: 2,
    borderColor: "#ffb300",
  },

  abilityText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },

  hiddenTag: {
    backgroundColor: "#ffb300",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  hiddenTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
    textTransform: "uppercase",
  },

  // Stats
  statsTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  totalStatsBadge: {
    backgroundColor: "#7C4DFF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 15,
  },

  totalStatsText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  statItem: {
    marginBottom: 16,
  },

  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  statIcon: {
    fontSize: 18,
    marginRight: 10,
  },

  statName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
  },

  statValue: {
    fontSize: 16,
    fontWeight: "900",
    minWidth: 40,
    textAlign: "right",
  },

  statBarContainer: {
    height: 12,
    backgroundColor: "#e9ecef",
    borderRadius: 6,
    overflow: "hidden",
  },

  statBarFill: {
    height: "100%",
    borderRadius: 6,
  },

  // Sprites Gallery
  spritesScroll: {
    gap: 14,
    paddingVertical: 4,
  },

  spriteCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    minWidth: 110,
    position: "relative",
  },

  shinyCard: {
    backgroundColor: "#fffde7",
    borderWidth: 2,
    borderColor: "#ffd54f",
  },

  shinyBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },

  shinyBadgeText: {
    fontSize: 16,
  },

  spriteImage: {
    width: 90,
    height: 90,
  },

  spriteLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
    marginTop: 8,
  },

  // Habitat
  habitatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    gap: 14,
  },

  habitatIcon: {
    fontSize: 28,
  },

  habitatText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2e7d32",
  },
});
