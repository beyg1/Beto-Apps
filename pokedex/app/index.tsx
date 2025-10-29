// ============================================================================
// IMPORTS - React Native and Expo Router Components
// ============================================================================

import { ScrollView, Text, View, Image, StyleSheet,} from "react-native";
import { useEffect, useState } from "react";
import { Link } from "expo-router";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

/**
 * Pokemon interface defining the structure of Pokemon data displayed in the list
 * @interface Pokemon
 * @property {string} name - The name of the Pokemon (used as unique identifier)
 * @property {string} url - The API URL to fetch detailed Pokemon information
 * @property {string} image - The official artwork image URL for display
 * @property {string[]} types - Array of Pokemon types (fire, water, grass, etc.)
 */
interface Pokemon{
  name: string;
  url: string;
  image: string;
  types: string[];
}

// ============================================================================
// THEME AND STYLING CONSTANTS
// ============================================================================

/**
 * Background color mapping for different Pokemon types
 * Each Pokemon type has an associated color for UI theming
 * Based on official Pokemon type colors from the games
 * @type {Record<string, string>}
 */
const bgColor: Record<string, string> = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC"
}
// ============================================================================
// MAIN COMPONENT FUNCTION
// ============================================================================

/**
 * Index Component - Main Pokemon List Screen
 * This is the entry point of the app, displaying a scrollable list of Pokemon
 * Each Pokemon card is clickable and navigates to the details screen
 */
export default function Index() {
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /**
   * State to store the list of Pokemon with detailed information
   * Initialized as empty array and populated when API data is fetched
   * @type {useState<Pokemon[]>} - Array of Pokemon objects
   */
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);

  // ============================================================================
  // LIFECYCLE AND DATA FETCHING
  // ============================================================================
  
  /**
   * useEffect hook to trigger data fetching when component mounts
   * Empty dependency array ensures this runs only once on component initialization
   */
  useEffect(() => {
    // Initialize data fetching on component mount
    fetchPokemons();
  }, [])

  /**
   * Async function to fetch Pokemon data from PokeAPI
   * Makes two sequential API calls:
   * 1. Get basic Pokemon list (names and URLs)
   * 2. Fetch detailed data for each Pokemon (image, types, etc.)
   */
  async function fetchPokemons() {
    try{
      // Step 1: Fetch basic Pokemon list from PokeAPI (limiting to first 10 for performance)
      const response = await fetch("https://pokeapi.co/api/v2/pokemon/?limit=100");
      const data = await response.json();
      
      // Step 2: For each Pokemon, fetch detailed information in parallel
      // Using Promise.all for concurrent API calls to improve performance
      const detailedPokemons = await Promise.all(
        data.results.map(async (pokemon: Pokemon) => {
          // Fetch detailed data for each Pokemon
          const response = await fetch(pokemon.url);
          const data = await response.json();
          
          // Return standardized Pokemon object with required fields
          return {
            name: data.name,
            image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
            types: data.types.map((type: any) => type.type.name)
          };
        })
      );

      // Step 3: Update component state with fetched Pokemon data
      setPokemons(detailedPokemons);
     
    } catch(e) {
      // Basic error handling - in production, consider showing user-friendly error messages
      console.log(e);
    }
  }

// ============================================================================
// UI RENDERING
// ============================================================================

  /**
   * Main render function - displays scrollable list of Pokemon cards
   * Each Pokemon is rendered as a clickable card that navigates to details screen
   */
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
     {pokemons.map((pokemon) => (
      /**
       * Each Pokemon card wrapped in View with unique key for React rendering optimization
       * Link component enables navigation to details screen with Pokemon name as parameter
       */
      <View key={pokemon.name} style={styles.linkWrapper}>
        <Link
          href={{pathname: "/details", params:{name: pokemon.name}}}
          style={{ textDecorationLine: 'none' }}
        >
          <View
            /**
             * Dynamic styling based on Pokemon types
             * Uses first type found in bgColor mapping, falls back to default color
             * Includes card-like styling with shadows and rounded corners
             */
            style={{
              backgroundColor: (() => {
                // Find first matching type in Pokemon types array
                const matchingType = pokemon.types.find(type => bgColor[type]);
                // Use matched color or fallback to default
                return matchingType ? bgColor[matchingType] : "#68A090";
              })(),
              
              borderRadius: 20,           // Rounded corners for card appearance
              padding: 20,               // Internal padding for content
              width: "100%",             // Full width of container
              
              // Shadow effects for iOS
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              
              // Elevation for Android
              elevation: 8,
            }}
          >
            {/* Pokemon Name - styled prominently */}
            <Text style={styles.name}>{pokemon.name}</Text>
            
            {/* Pokemon Image - official artwork or fallback sprite */}
            <Image
              source={{ uri: pokemon.image }}
              style={{ width: 200, height: 200, alignSelf: "center" }}
              resizeMode="contain"
            />
            
            {/* Pokemon Types - displayed as comma-separated string */}
            <Text style={styles.type}>{pokemon.types.join(", ")}</Text>
          </View>
        </Link>
      </View>
     ))}
    </ScrollView>
  );
}

// ============================================================================
// STYLESHEET - Component Styling
// ============================================================================

/**
 * StyleSheet for the Index component
 * Contains all visual styling for the Pokemon list cards and layout
 */
const styles = StyleSheet.create({
  // Main container styles for the ScrollView
  container: {
    paddingHorizontal: 15,  // Horizontal padding for screen edges
    paddingVertical: 15,    // Vertical padding between cards
  },

  // Wrapper for each Pokemon card
  linkWrapper: {
    marginVertical: 10,     // Vertical spacing between Pokemon cards
  },

  // Pokemon name text styling
  name: {
    textAlign: "center",     // Center-align the Pokemon name
    fontSize: 28,            // Large font size for prominence
    fontWeight: "900",       // Extra bold weight for emphasis
    paddingVertical: 12,     // Padding above and below name
    color: "#FFFFFF",        // White color for contrast
    textShadowColor: "rgba(0, 0, 0, 0.7)",     // Dark shadow for readability
    textShadowOffset: { width: 2, height: 2 }, // Shadow positioning
    textShadowRadius: 4,     // Shadow blur radius
    letterSpacing: 1,        // Slight letter spacing for style
    textTransform: "capitalize", // Capitalize first letter of name
  },

  // Pokemon types text styling
  type: {
    textAlign: "center",     // Center-align the types
    fontSize: 14,            // Smaller font size than name
    fontWeight: "600",       // Semi-bold weight
    color: "#FFFFFF",        // White color for consistency
    paddingVertical: 6,      // Padding above and below types
    textShadowColor: "rgba(0, 0, 0, 0.6)",     // Slightly lighter shadow
    textShadowOffset: { width: 1, height: 1 }, // Smaller shadow offset
    textShadowRadius: 2,     // Smaller blur radius
    letterSpacing: 0.5,      // Tight letter spacing
    textTransform: "uppercase", // All caps for type display
  },
});