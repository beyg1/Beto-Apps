// ============================================================================
// IMPORTS
// ============================================================================

import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { memo, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const ITEMS_PER_PAGE = 10;

// ============================================================================
// INTERFACES
// ============================================================================

interface Pokemon {
  name: string;
  url: string;
  image: string;
  types: string[];
  id: number;
}

// ============================================================================
// THEME CONSTANTS
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

// ============================================================================
// POKEMON CARD COMPONENT
// ============================================================================

interface PokemonCardProps {
  pokemon: Pokemon;
  index: number;
}

const PokemonCard = memo(function PokemonCard({
  pokemon,
  index,
}: PokemonCardProps) {
  const scale = useSharedValue(1);

  const getGradientColors = (): [string, string] => {
    const matchingType = pokemon.types.find((type) => typeGradients[type]);
    return matchingType ? typeGradients[matchingType] : ["#68A090", "#4A7C6F"];
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const formattedId = `#${pokemon.id.toString().padStart(3, "0")}`;
  const gradientColors = getGradientColors();

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).duration(350)}
      style={styles.cardWrapper}
    >
      <Link
        href={{ pathname: "/details", params: { name: pokemon.name } }}
        asChild
      >
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
          <Animated.View style={animatedCardStyle}>
            <View
              style={[
                styles.cardShadow,
                { backgroundColor: gradientColors[0] },
              ]}
            />

            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View style={styles.idBadge}>
                <Text style={styles.idText}>{formattedId}</Text>
              </View>

              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: pokemon.image }}
                  style={styles.pokemonImage}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.pokemonName}>{pokemon.name}</Text>

              <View style={styles.typesContainer}>
                {pokemon.types.map((type) => (
                  <View key={type} style={styles.typeBadge}>
                    <Text style={styles.typeText}>{type}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.pokeballDecor} />
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </Link>
    </Animated.View>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Index() {
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(allPokemons.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPokemons = allPokemons.slice(startIndex, endIndex);

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

      setAllPokemons(detailedPokemons);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Pokemon; index: number }) => (
      <PokemonCard pokemon={item} index={index} />
    ),
    []
  );

  const keyExtractor = useCallback((item: Pokemon) => item.name, []);

  const ListHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerSubtitle}>Discover your favorite</Text>
      <Text style={styles.headerTitle}>Pokémon</Text>
      <View style={styles.headerLine} />
    </View>
  );

  const ListFooter = () => (
    <View style={styles.paginationContainer}>
      <Pressable
        style={[
          styles.pageButton,
          currentPage === 1 && styles.pageButtonDisabled,
        ]}
        onPress={goToPrevPage}
        disabled={currentPage === 1}
      >
        <Text
          style={[
            styles.pageButtonText,
            currentPage === 1 && styles.pageButtonTextDisabled,
          ]}
        >
          ← Previous
        </Text>
      </Pressable>

      <View style={styles.pageInfo}>
        <Text style={styles.pageNumber}>{currentPage}</Text>
        <Text style={styles.pageDivider}>of</Text>
        <Text style={styles.pageNumber}>{totalPages}</Text>
      </View>

      <Pressable
        style={[
          styles.pageButton,
          currentPage === totalPages && styles.pageButtonDisabled,
        ]}
        onPress={goToNextPage}
        disabled={currentPage === totalPages}
      >
        <Text
          style={[
            styles.pageButtonText,
            currentPage === totalPages && styles.pageButtonTextDisabled,
          ]}
        >
          Next →
        </Text>
      </Pressable>
    </View>
  );

  // ============================================================================
  // UI RENDERING
  // ============================================================================

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0a0a14", "#12121f", "#1a1a30"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C4DFF" />
          <Text style={styles.loadingText}>Loading Pokémon...</Text>
        </View>
      ) : (
        <FlatList
          data={currentPokemons}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
        />
      )}
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

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  bgCircle1: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(124, 77, 255, 0.06)",
  },

  bgCircle2: {
    position: "absolute",
    bottom: 100,
    left: -120,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255, 107, 53, 0.04)",
  },

  // Header
  header: {
    paddingTop: 20,
    paddingBottom: 20,
  },

  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "500",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  headerTitle: {
    fontSize: 42,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
    marginTop: 4,
  },

  headerLine: {
    width: 50,
    height: 4,
    backgroundColor: "#7C4DFF",
    borderRadius: 2,
    marginTop: 12,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    marginTop: 16,
    fontWeight: "600",
  },

  // Card
  cardWrapper: {
    marginBottom: 18,
  },

  cardShadow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    bottom: -6,
    borderRadius: 24,
    opacity: 0.35,
  },

  card: {
    borderRadius: 24,
    padding: 18,
    minHeight: 220,
    overflow: "hidden",
    position: "relative",
  },

  idBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  idText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },

  imageContainer: {
    alignItems: "center",
    marginTop: 8,
  },

  pokemonImage: {
    width: 150,
    height: 150,
  },

  pokemonName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    textTransform: "capitalize",
    marginTop: 6,
  },

  typesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },

  typeBadge: {
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },

  typeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  pokeballDecor: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 18,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },

  // Pagination
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },

  pageButton: {
    backgroundColor: "#7C4DFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },

  pageButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  pageButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  pageButtonTextDisabled: {
    color: "rgba(255,255,255,0.3)",
  },

  pageInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  pageNumber: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  pageDivider: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },
});
