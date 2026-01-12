// ============================================================================
// IMPORTS - React Native, Expo Router, and Animation Components
// ============================================================================

import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
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
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface Pokemon {
  name: string;
  url: string;
  image: string;
  types: string[];
  id: number;
}

// ============================================================================
// THEME AND STYLING CONSTANTS
// ============================================================================

const typeGradients: Record<string, [string, string]> = {
  normal: ["#A8A878", "#8A8A59"],
  fire: ["#FF6B35", "#F7931A"],
  water: ["#4FC3F7", "#0288D1"],
  electric: ["#FFD54F", "#FF8F00"],
  grass: ["#66BB6A", "#2E7D32"],
  ice: ["#80DEEA", "#4DD0E1"],
  fighting: ["#EF5350", "#C62828"],
  poison: ["#BA68C8", "#7B1FA2"],
  ground: ["#FFCC80", "#E65100"],
  flying: ["#CE93D8", "#9575CD"],
  psychic: ["#FF6B9D", "#BA68C8"],
  bug: ["#AED581", "#7CB342"],
  rock: ["#BCAAA4", "#8D6E63"],
  ghost: ["#7C4DFF", "#4527A0"],
  dragon: ["#7C4DFF", "#536DFE"],
  dark: ["#78909C", "#455A64"],
  steel: ["#B0BEC5", "#78909C"],
  fairy: ["#F48FB1", "#EC407A"],
};

const typeColors: Record<string, string> = {
  normal: "#A8A878",
  fire: ["#FF6B35", "#F7931A"],
  water: "#4FC3F7",
  electric: "#FFD54F",
  grass: "#66BB6A",
  ice: "#80DEEA",
  fighting: "#EF5350",
  poison: "#BA68C8",
  ground: "#FFCC80",
  flying: "#CE93D8",
  psychic: "#FF6B9D",
  bug: "#AED581",
  rock: "#BCAAA4",
  ghost: "#7C4DFF",
  dragon: "#7C4DFF",
  dark: "#78909C",
  steel: "#B0BEC5",
  fairy: "#F48FB1",
};

// ============================================================================
// ANIMATED POKEMON IMAGE COMPONENT (with floating effect)
// ============================================================================

function FloatingImage({ uri }: { uri: string }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Image
        source={{ uri }}
        style={styles.pokemonImage}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

// ============================================================================
// ANIMATED CARD COMPONENT
// ============================================================================

interface PokemonCardProps {
  pokemon: Pokemon;
  index: number;
}

function PokemonCard({ pokemon, index }: PokemonCardProps) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const getGradientColors = () => {
    const matchingType = pokemon.types.find((type) => typeGradients[type]);
    return matchingType ? typeGradients[matchingType] : ["#68A090", "#4A7C6F"];
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0.3, 0.6]),
    transform: [{ scale: interpolate(glow.value, [0, 1], [1, 1.02]) }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const formattedId = `#${pokemon.id.toString().padStart(3, "0")}`;
  const gradientColors = getGradientColors();

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)
        .duration(500)
        .springify()
        .damping(12)}
      style={styles.cardWrapper}
    >
      <Link
        href={{ pathname: "/details", params: { name: pokemon.name } }}
        asChild
      >
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
          <Animated.View style={animatedCardStyle}>
            {/* Glow Effect Behind Card */}
            <Animated.View
              style={[
                styles.cardGlow,
                animatedGlowStyle,
                { backgroundColor: gradientColors[0] },
              ]}
            />

            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {/* Glassmorphism overlay */}
              <View style={styles.glassOverlay}>
                {/* Pokemon ID Badge */}
                <View style={styles.idBadge}>
                  <Text style={styles.idText}>{formattedId}</Text>
                </View>

                {/* Pokemon Image with Floating Animation */}
                <View style={styles.imageContainer}>
                  <FloatingImage uri={pokemon.image} />
                </View>

                {/* Pokemon Name */}
                <Text style={styles.pokemonName}>{pokemon.name}</Text>

                {/* Type Badges */}
                <View style={styles.typesContainer}>
                  {pokemon.types.map((type) => (
                    <View
                      key={type}
                      style={[
                        styles.typeBadge,
                        { backgroundColor: "rgba(0,0,0,0.25)" },
                      ]}
                    >
                      <Text style={styles.typeText}>{type}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Decorative Patterns */}
              <View style={styles.pokeballDecor}>
                <View style={styles.pokeballInner} />
              </View>
              <View style={styles.circleDecor1} />
              <View style={styles.circleDecor2} />
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </Link>
    </Animated.View>
  );
}

// ============================================================================
// LOADING SKELETON CARD
// ============================================================================

function SkeletonCard({ index }: { index: number }) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedShimmerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(shimmer.value, [0, 1], [-200, 400]) },
    ],
  }));

  return (
    <Animated.View
      entering={FadeIn.delay(index * 100).duration(400)}
      style={styles.skeletonCard}
    >
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonImage} />
        <View style={styles.skeletonText} />
        <View style={styles.skeletonBadges}>
          <View style={styles.skeletonBadge} />
          <View style={styles.skeletonBadge} />
        </View>
      </View>
      <Animated.View style={[styles.shimmerOverlay, animatedShimmerStyle]} />
    </Animated.View>
  );
}

// ============================================================================
// MAIN COMPONENT FUNCTION
// ============================================================================

export default function Index() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPokemons();
  }, []);

  async function fetchPokemons() {
    try {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon/?limit=100"
      );
      const data = await response.json();

      const detailedPokemons = await Promise.all(
        data.results.map(async (pokemon: Pokemon) => {
          const response = await fetch(pokemon.url);
          const data = await response.json();

          return {
            id: data.id,
            name: data.name,
            image:
              data.sprites.other["official-artwork"].front_default ||
              data.sprites.front_default,
            types: data.types.map((type: any) => type.type.name),
          };
        })
      );

      setPokemons(detailedPokemons);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  }

  // ============================================================================
  // UI RENDERING
  // ============================================================================

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0a0a14", "#12121f", "#1a1a30", "#0f0f1a"]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Background Circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(100)}
          style={styles.header}
        >
          <Text style={styles.headerSubtitle}>Discover your favorite</Text>
          <Text style={styles.headerTitle}>Pokémon</Text>
          <View style={styles.headerLine} />
        </Animated.View>

        {/* Loading State */}
        {loading && (
          <View style={styles.cardsContainer}>
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </View>
        )}

        {/* Pokemon Cards Grid */}
        {!loading && (
          <View style={styles.cardsContainer}>
            {pokemons.map((pokemon, index) => (
              <PokemonCard key={pokemon.name} pokemon={pokemon} index={index} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLESHEET
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a14",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Background Decorations
  bgCircle1: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(124, 77, 255, 0.08)",
  },

  bgCircle2: {
    position: "absolute",
    bottom: 200,
    left: -150,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "rgba(255, 107, 53, 0.06)",
  },

  bgCircle3: {
    position: "absolute",
    top: 400,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(102, 187, 106, 0.07)",
  },

  // Header Styles
  header: {
    paddingTop: 20,
    paddingBottom: 30,
  },

  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "500",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  headerTitle: {
    fontSize: 48,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
    marginTop: 4,
  },

  headerLine: {
    width: 60,
    height: 4,
    backgroundColor: "#7C4DFF",
    borderRadius: 2,
    marginTop: 12,
  },

  // Cards Container
  cardsContainer: {
    gap: 24,
  },

  // Card Wrapper
  cardWrapper: {
    width: "100%",
  },

  // Card Glow Effect
  cardGlow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    bottom: -10,
    borderRadius: 28,
    opacity: 0.4,
  },

  // Card
  card: {
    borderRadius: 28,
    overflow: "hidden",
    position: "relative",
    minHeight: 240,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },

  // Glassmorphism Overlay
  glassOverlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },

  // ID Badge
  idBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  idText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  // Image Container
  imageContainer: {
    alignItems: "center",
    marginTop: 15,
  },

  pokemonImage: {
    width: 200,
    height: 200,
  },

  // Pokemon Name
  pokemonName: {
    fontSize: 30,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    textTransform: "capitalize",
    marginTop: 10,
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  // Types Container
  typesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 14,
  },

  // Type Badge
  typeBadge: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  typeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },

  // Decorative Pokeball
  pokeballDecor: {
    position: "absolute",
    right: -50,
    top: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 25,
    borderColor: "rgba(255, 255, 255, 0.08)",
    opacity: 0.5,
  },

  pokeballInner: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -25,
    marginLeft: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 10,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  // Additional Decorative Circles
  circleDecor1: {
    position: "absolute",
    left: -30,
    bottom: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },

  circleDecor2: {
    position: "absolute",
    left: 40,
    bottom: -20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },

  // Skeleton Loading Styles
  skeletonCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 28,
    minHeight: 240,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },

  skeletonContent: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  skeletonImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 16,
  },

  skeletonText: {
    width: 120,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 12,
  },

  skeletonBadges: {
    flexDirection: "row",
    gap: 12,
  },

  skeletonBadge: {
    width: 70,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },

  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 200,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    transform: [{ skewX: "-20deg" }],
  },
});
