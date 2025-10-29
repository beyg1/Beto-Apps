// ============================================================================
// IMPORTS - React Native and Expo Router Components
// ============================================================================

import { useLocalSearchParams } from "expo-router/build/hooks";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

// ============================================================================
// TYPESCRIPT INTERFACES FOR POKEMON DATA STRUCTURE
// ============================================================================

/**
 * PokemonStat interface - Represents individual Pokemon stats
 * @interface PokemonStat
 * @property {number} base_stat - The base value of this stat
 * @property {number} effort - Effort values gained when defeating this Pokemon
 * @property {object} stat - Information about the stat itself
 */
interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

/**
 * PokemonAbility interface - Represents Pokemon abilities
 * @interface PokemonAbility
 * @property {object} ability - Information about the ability
 * @property {boolean} is_hidden - Whether this is a hidden ability
 * @property {number} slot - The slot number for this ability
 */
interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

/**
 * PokemonSprites interface - Represents Pokemon images/sprites
 * @interface PokemonSprites
 * @property {string | null} front_default - Standard front sprite
 * @property {string | null} front_shiny - Shiny version front sprite
 * @property {string | null} back_default - Standard back sprite
 * @property {string | null} back_shiny - Shiny version back sprite
 * @property {object} other - Additional sprite sources
 */
interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default: string | null;
  back_shiny: string | null;
  other: {
    'official-artwork': {
      front_default: string | null;
    };
    dream_world: {
      front_default: string | null;
    };
  };
}

/**
 * PokemonType interface - Represents Pokemon types
 * @interface PokemonType
 * @property {number} slot - The slot number for this type
 * @property {object} type - Information about the type
 */
interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

/**
 * Pokemon interface - Complete Pokemon data structure
 * @interface Pokemon
 * @property {number} id - Unique Pokemon identifier
 * @property {string} name - Pokemon name
 * @property {number} height - Height in decimeters
 * @property {number} weight - Weight in hectograms
 * @property {number} base_experience - Base experience gained from defeating
 * @property {PokemonType[]} types - Array of Pokemon types
 * @property {PokemonStat[]} stats - Array of Pokemon stats
 * @property {PokemonAbility[]} abilities - Array of Pokemon abilities
 * @property {PokemonSprites} sprites - Pokemon images and artwork
 * @property {string} location_area_encounters - URL for encounter locations
 */
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

/**
 * PokemonSpecies interface - Species-specific Pokemon information
 * @interface PokemonSpecies
 * @property {object | null} habitat - Information about Pokemon habitat
 * @property {object[]} flavor_text_entries - Array of flavor text descriptions
 */
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
}

// ============================================================================
// THEME AND CONSTANTS
// ============================================================================

/**
 * Background color mapping for different Pokemon types
 * Same color scheme as index.tsx for consistent theming
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
};

/**
 * Human-readable stat names mapping
 * Converts API stat names to user-friendly display names
 * @type {Record<string, string>}
 */
const statNames: Record<string, string> = {
  'hp': 'HP',
  'attack': 'Attack',
  'defense': 'Defense',
  'special-attack': 'Sp. Attack',
  'special-defense': 'Sp. Defense',
  'speed': 'Speed'
};

// ============================================================================
// MAIN COMPONENT FUNCTION
// ============================================================================

/**
 * Details Component - Pokemon Detail Screen
 * Displays comprehensive information about a selected Pokemon
 * Includes stats, abilities, physical characteristics, and images
 * @returns JSX.Element - The rendered Pokemon details screen
 */
export default function Details() {
  
  // ============================================================================
  // ROUTER AND STATE MANAGEMENT
  // ============================================================================
  
  // Extract Pokemon name from URL parameters (passed from index screen)
  const params = useLocalSearchParams();
  
  /**
   * State to store comprehensive Pokemon data
   * @type {useState<Pokemon | null>}
   */
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  
  /**
   * State to store Pokemon species information (habitat, description)
   * @type {useState<PokemonSpecies | null>}
   */
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  
  /**
   * Loading state for API requests
   * @type {useState<boolean>}
   */
  const [loading, setLoading] = useState(true);
  
  /**
   * Error state for handling API failures
   * @type {useState<string | null>}
   */
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // LIFECYCLE AND DATA FETCHING
  // ============================================================================
  
  /**
   * Effect hook to fetch Pokemon details when component mounts or Pokemon name changes
   * Dependencies include params.name to refetch when navigating to different Pokemon
   */
  useEffect(() => {
    // Only fetch if we have a Pokemon name parameter
    if (params.name) {
      fetchDetails(params.name as string);
    }
  }, [params.name]);

  /**
   * Async function to fetch comprehensive Pokemon data
   * Makes two separate API calls:
   * 1. Main Pokemon data (stats, abilities, sprites, etc.)
   * 2. Species data (habitat, flavor text descriptions)
   * @param {string} name - The name of the Pokemon to fetch
   */
  async function fetchDetails(name: string) {
    try {
      // Start loading state and clear any previous errors
      setLoading(true);
      setError(null);
      
      // ============================================================================
      // FETCH MAIN POKEMON DATA
      // ============================================================================
      
      // Make API request to get detailed Pokemon information
      const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      
      // Check if the response was successful
      if (!pokemonResponse.ok) {
        throw new Error(`Failed to fetch Pokemon: ${pokemonResponse.status}`);
      }
      
      // Parse JSON response and update state
      const pokemonData = await pokemonResponse.json();
      setPokemon(pokemonData);

      // ============================================================================
      // FETCH SPECIES DATA
      // ============================================================================
      
      // Make separate API request for species-specific information
      const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`);
      
      // Check species response
      if (!speciesResponse.ok) {
        throw new Error(`Failed to fetch species: ${speciesResponse.status}`);
      }
      
      // Parse species JSON and update state
      const speciesData = await speciesResponse.json();
      setSpecies(speciesData);

    } catch (err) {
      // Handle any errors that occurred during data fetching
      setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon details');
      console.error('Error fetching Pokemon details:', err);
    } finally {
      // Always stop loading state, whether success or failure
      setLoading(false);
    }
  }

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

  /**
   * Extracts and formats Pokemon description from species data
   * Finds the first English flavor text entry and cleans it for display
   * @returns {string} - Formatted Pokemon description or empty string
   */
  const getFlavorText = () => {
    // Return empty string if no species data available
    if (!species?.flavor_text_entries) return '';
    
    // Find the first entry in English language
    const englishEntry = species.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    );
    
    // Return cleaned text (remove form feed characters) or empty string
    return englishEntry ? englishEntry.flavor_text.replace(/\f/g, ' ') : '';
  };

  /**
   * Determines the primary background color based on Pokemon's first type
   * Uses the type color mapping with fallback to default color
   * @returns {string} - Hex color string for background theming
   */
  const getPrimaryTypeColor = () => {
    // Return default color if no Pokemon data or types available
    if (!pokemon?.types.length) return "#68A090";
    
    // Get the primary (first) type from the types array
    const primaryType = pokemon.types[0].type.name;
    
    // Return the mapped color for the type or fallback
    return bgColor[primaryType] || "#68A090";
  };

  /**
   * Returns appropriate color for stat value based on strength
   * Implements a color-coded system for visual stat representation
   * @param {number} value - The stat value to color-code
   * @returns {string} - Hex color string for the stat indicator
   */
  const getStatColor = (value: number) => {
    if (value >= 100) return "#4CAF50";  // Green for excellent stats (100+)
    if (value >= 80) return "#8BC34A";   // Light green for good stats (80-99)
    if (value >= 60) return "#FFC107";   // Yellow for average stats (60-79)
    if (value >= 40) return "#FF9800";   // Orange for below average stats (40-59)
    return "#F44336";                    // Red for poor stats (<40)
  };

// ============================================================================
// LOADING STATE
// ============================================================================

  /**
   * Render loading state while fetching Pokemon data
   * Shows activity indicator and loading message
   */
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading Pokemon details...</Text>
      </View>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  /**
   * Render error state if data fetching failed or Pokemon not found
   * Displays error message to user
   */
  if (error || !pokemon) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>
          {error || 'Pokemon not found'}
        </Text>
      </View>
    );
  }

// ============================================================================
// MAIN UI RENDERING
// ============================================================================

  /**
   * Main render method displaying comprehensive Pokemon information
   * Organized in sections with different background colors based on Pokemon type
   */
  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: getPrimaryTypeColor() }]}
      showsVerticalScrollIndicator={false}
    >
      
      {/* ============================================================================
          HEADER SECTION - Pokemon Name and ID
      ============================================================================ */}
      <View style={styles.header}>
        <Text style={styles.pokemonName}>{pokemon.name}</Text>
        <Text style={styles.pokemonId}>#{pokemon.id.toString().padStart(3, '0')}</Text>
      </View>

      {/* ============================================================================
          MAIN IMAGE SECTION - Official Artwork Display
      ============================================================================ */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default || '' }}
          style={styles.mainImage}
          resizeMode="contain"
        />
      </View>

      {/* ============================================================================
          SPRITES GALLERY SECTION - Multiple View Angles and Variants
      ============================================================================ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gallery</Text>
        <View style={styles.spritesContainer}>
          {/* Standard front sprite */}
          {pokemon.sprites.front_default && (
            <View style={styles.spriteItem}>
              <Image source={{ uri: pokemon.sprites.front_default }} style={styles.sprite} />
              <Text style={styles.spriteLabel}>Normal</Text>
            </View>
          )}
          
          {/* Shiny variant front sprite */}
          {pokemon.sprites.front_shiny && (
            <View style={styles.spriteItem}>
              <Image source={{ uri: pokemon.sprites.front_shiny }} style={styles.sprite} />
              <Text style={styles.spriteLabel}>Shiny</Text>
            </View>
          )}
          
          {/* Standard back sprite */}
          {pokemon.sprites.back_default && (
            <View style={styles.spriteItem}>
              <Image source={{ uri: pokemon.sprites.back_default }} style={styles.sprite} />
              <Text style={styles.spriteLabel}>Back</Text>
            </View>
          )}
          
          {/* Shiny back sprite */}
          {pokemon.sprites.back_shiny && (
            <View style={styles.spriteItem}>
              <Image source={{ uri: pokemon.sprites.back_shiny }} style={styles.sprite} />
              <Text style={styles.spriteLabel}>Shiny Back</Text>
            </View>
          )}
        </View>
      </View>

      {/* ============================================================================
          POKEMON TYPES SECTION - Type Badges with Color Coding
      ============================================================================ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Types</Text>
        <View style={styles.typesContainer}>
          {pokemon.types.map((type) => (
            <View
              key={type.type.name}
              style={[styles.typeBadge, { backgroundColor: bgColor[type.type.name] || '#68A090' }]}
            >
              <Text style={styles.typeText}>{type.type.name.toUpperCase()}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ============================================================================
          PHYSICAL CHARACTERISTICS SECTION - Size and Experience Data
      ============================================================================ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Physical Characteristics</Text>
        <View style={styles.characteristicsContainer}>
          <View style={styles.characteristicItem}>
            <Text style={styles.characteristicLabel}>Height</Text>
            <Text style={styles.characteristicValue}>{(pokemon.height / 10).toFixed(1)} m</Text>
          </View>
          <View style={styles.characteristicItem}>
            <Text style={styles.characteristicLabel}>Weight</Text>
            <Text style={styles.characteristicValue}>{(pokemon.weight / 10).toFixed(1)} kg</Text>
          </View>
          <View style={styles.characteristicItem}>
            <Text style={styles.characteristicLabel}>Base Experience</Text>
            <Text style={styles.characteristicValue}>{pokemon.base_experience}</Text>
          </View>
        </View>
      </View>

      {/* ============================================================================
          ABILITIES SECTION - Pokemon Powers and Skills
      ============================================================================ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Abilities</Text>
        {pokemon.abilities.map((ability) => (
          <View key={ability.ability.name} style={styles.abilityItem}>
            <Text style={styles.abilityName}>
              {ability.ability.name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
            {ability.is_hidden && (
              <Text style={styles.hiddenAbility}>Hidden Ability</Text>
            )}
          </View>
        ))}
      </View>

      {/* ============================================================================
          STATS SECTION - Visual Stat Bars with Color Coding
      ============================================================================ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Base Stats</Text>
        {pokemon.stats.map((stat) => (
          <View key={stat.stat.name} style={styles.statItem}>
            <View style={styles.statHeader}>
              <Text style={styles.statName}>{statNames[stat.stat.name] || stat.stat.name}</Text>
              <Text style={styles.statValue}>{stat.base_stat}</Text>
            </View>
            <View style={styles.statBar}>
              <View
                style={[
                  styles.statFill,
                  {
                    // Width calculation based on stat value (max 200 for scaling)
                    width: `${Math.min((stat.base_stat / 200) * 100, 100)}%`,
                    backgroundColor: getStatColor(stat.base_stat)
                  }
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* ============================================================================
          HABITAT AND DESCRIPTION SECTION - Species Information
      ============================================================================ */}
      {(species?.habitat || getFlavorText()) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          
          {/* Habitat information if available */}
          {species?.habitat && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Habitat</Text>
              <Text style={styles.infoValue}>
                {species.habitat.name.replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
          )}
          
          {/* Pokemon description/flavor text if available */}
          {getFlavorText() && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Description</Text>
              <Text style={styles.infoValue}>{getFlavorText()}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

// ============================================================================
// STYLESHEET - Component Styling
// ============================================================================

/**
 * StyleSheet for the Details component
 * Contains all visual styling for Pokemon detail sections and layout
 */
const styles = StyleSheet.create({
  
  // ============================================================================
  // CONTAINER AND LAYOUT STYLES
  // ============================================================================
  
  // Main container for the entire scrollable content
  container: {
    flexGrow: 1,
    padding: 15,            // Global padding for all content
    gap: 20,               // Spacing between main sections
  },

  // Center content alignment for loading and error states
  centerContent: {
    justifyContent: 'center', // Vertical centering
    alignItems: 'center',     // Horizontal centering
  },

  // Loading indicator text styling
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },

  // Error message text styling
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },

  // ============================================================================
  // HEADER SECTION STYLES
  // ============================================================================
  
  // Container for Pokemon name and ID
  header: {
    alignItems: 'center',   // Center-align text elements
    marginTop: 20,         // Top margin for spacing
  },

  // Large Pokemon name styling
  pokemonName: {
    fontSize: 36,          // Extra large for prominence
    fontWeight: '900',     // Extra bold weight
    color: '#FFFFFF',      // White color for contrast
    textShadowColor: 'rgba(0, 0, 0, 0.7)',     // Dark shadow for readability
    textShadowOffset: { width: 2, height: 2 }, // Shadow positioning
    textShadowRadius: 4,   // Shadow blur radius
    letterSpacing: 1,      // Slight letter spacing
    textTransform: 'capitalize', // Proper name capitalization
  },

  // Smaller Pokemon ID number styling
  pokemonId: {
    fontSize: 20,          // Medium-large font size
    fontWeight: '600',     // Semi-bold weight
    color: '#FFFFFF',      // White color
    opacity: 0.9,          // Slightly transparent for hierarchy
    marginTop: 5,         // Space from Pokemon name
  },

  // ============================================================================
  // IMAGE SECTION STYLES
  // ============================================================================
  
  // Container for main Pokemon image
  imageContainer: {
    alignItems: 'center',  // Center the image horizontally
    padding: 20,          // Internal padding
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle background
    borderRadius: 20,     // Rounded corners
    marginTop: 10,       // Top spacing
  },

  // Main Pokemon image dimensions
  mainImage: {
    width: 250,           // Large image size for detail view
    height: 250,          // Square image
  },

  // ============================================================================
  // SECTION CONTAINER STYLES
  // ============================================================================
  
  // Generic section container with semi-transparent background
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Semi-transparent white
    padding: 20,          // Internal padding for content
    borderRadius: 15,     // Rounded corners
    marginTop: 10,       // Space between sections
  },

  // Section title styling
  sectionTitle: {
    fontSize: 24,         // Large title font
    fontWeight: '800',    // Extra bold weight
    color: '#FFFFFF',     // White color
    marginBottom: 15,     // Space below title
    textAlign: 'center',  // Center-align title
    textShadowColor: 'rgba(0, 0, 0, 0.5)',     // Shadow for readability
    textShadowOffset: { width: 1, height: 1 }, // Light shadow
    textShadowRadius: 2,  // Small blur radius
  },

  // ============================================================================
  // SPRITES GALLERY STYLES
  // ============================================================================
  
  // Container for sprite gallery layout
  spritesContainer: {
    flexDirection: 'row',        // Horizontal layout
    justifyContent: 'space-around', // Even spacing between sprites
    flexWrap: 'wrap',           // Wrap to next line if needed
    gap: 20,                   // Spacing between sprite items
  },

  // Individual sprite item container
  spriteItem: {
    alignItems: 'center',       // Center content vertically
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle background
    padding: 15,               // Internal padding
    borderRadius: 15,          // Rounded corners
    marginBottom: 10,          // Bottom spacing
  },

  // Individual sprite image size
  sprite: {
    width: 100,               // Medium size for gallery view
    height: 100,              // Square image
  },

  // Sprite label text styling
  spriteLabel: {
    color: '#FFFFFF',         // White text
    fontSize: 14,             // Small label font
    fontWeight: '600',        // Semi-bold weight
    marginTop: 8,            // Space above label
  },

  // ============================================================================
  // TYPES SECTION STYLES
  // ============================================================================
  
  // Container for type badges layout
  typesContainer: {
    flexDirection: 'row',     // Horizontal layout
    justifyContent: 'center', // Center the type badges
    flexWrap: 'wrap',        // Allow wrapping for many types
    gap: 10,                // Spacing between badges
  },

  // Individual type badge styling
  typeBadge: {
    paddingHorizontal: 20,   // Horizontal padding for badge
    paddingVertical: 8,      // Vertical padding
    borderRadius: 20,        // Fully rounded for pill shape
    elevation: 3,           // Android shadow elevation
    shadowColor: '#000',     // iOS shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow positioning
    shadowOpacity: 0.3,      // Shadow transparency
    shadowRadius: 4,         // Shadow blur radius
  },

  // Type badge text styling
  typeText: {
    color: '#FFFFFF',        // White text for contrast
    fontWeight: '800',       // Extra bold for prominence
    fontSize: 14,           // Medium text size
    textShadowColor: 'rgba(0, 0, 0, 0.5)',   // Shadow for readability
    textShadowOffset: { width: 1, height: 1 }, // Light shadow
    textShadowRadius: 2,     // Small blur radius
  },

  // ============================================================================
  // PHYSICAL CHARACTERISTICS STYLES
  // ============================================================================
  
  // Container for characteristics layout
  characteristicsContainer: {
    flexDirection: 'row',      // Horizontal layout for stats
    justifyContent: 'space-around', // Even spacing between items
  },

  // Individual characteristic item container
  characteristicItem: {
    alignItems: 'center',      // Center content
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle background
    padding: 15,             // Internal padding
    borderRadius: 10,        // Rounded corners
    minWidth: 100,           // Minimum width for consistent layout
  },

  // Characteristic label (e.g., "Height", "Weight")
  characteristicLabel: {
    color: '#FFFFFF',         // White text
    fontSize: 12,            // Small label font
    fontWeight: '600',       // Semi-bold weight
    opacity: 0.8,           // Slightly transparent for hierarchy
    marginBottom: 5,        // Space below label
  },

  // Characteristic value (e.g., "1.8 m", "90.5 kg")
  characteristicValue: {
    color: '#FFFFFF',         // White text
    fontSize: 18,            // Medium-large value font
    fontWeight: '800',       // Extra bold for emphasis
  },

  // ============================================================================
  // ABILITIES SECTION STYLES
  // ============================================================================
  
  // Individual ability item container
  abilityItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle background
    padding: 15,           // Internal padding
    borderRadius: 10,      // Rounded corners
    marginBottom: 10,      // Space between abilities
  },

  // Ability name text styling
  abilityName: {
    color: '#FFFFFF',      // White text
    fontSize: 18,         // Medium-large font
    fontWeight: '700',    // Bold weight
    textTransform: 'capitalize', // Proper capitalization
  },

  // Hidden ability indicator styling
  hiddenAbility: {
    color: '#FFD700',      // Gold color to indicate special status
    fontSize: 12,         // Small font size
    fontWeight: '600',    // Semi-bold weight
    marginTop: 5,        // Space above indicator
  },

  // ============================================================================
  // STATS SECTION STYLES
  // ============================================================================
  
  // Individual stat item container
  statItem: {
    marginBottom: 15,      // Space between stat items
  },

  // Container for stat name and value
  statHeader: {
    flexDirection: 'row',   // Horizontal layout
    justifyContent: 'space-between', // Space between name and value
    marginBottom: 5,       // Space below header
  },

  // Stat name text styling
  statName: {
    color: '#FFFFFF',      // White text
    fontSize: 16,         // Medium font size
    fontWeight: '600',    // Semi-bold weight
  },

  // Stat value text styling
  statValue: {
    color: '#FFFFFF',      // White text
    fontSize: 16,         // Medium font size
    fontWeight: '700',    // Bold weight
  },

  // Background bar for stat visualization
  statBar: {
    height: 8,            // Bar height
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent background
    borderRadius: 4,      // Rounded corners
    overflow: 'hidden',   // Clip the filled portion
  },

  // Colored fill portion of stat bar
  statFill: {
    height: '100%',       // Full height of container
    borderRadius: 4,      // Rounded corners
  },

  // ============================================================================
  // INFORMATION SECTION STYLES
  // ============================================================================
  
  // Individual information item container
  infoItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle background
    padding: 15,         // Internal padding
    borderRadius: 10,    // Rounded corners
    marginBottom: 10,    // Space between info items
  },

  // Information label styling (e.g., "Habitat", "Description")
  infoLabel: {
    color: '#FFFFFF',     // White text
    fontSize: 14,        // Medium font size
    fontWeight: '600',   // Semi-bold weight
    marginBottom: 5,     // Space below label
  },

  // Information value text styling
  infoValue: {
    color: '#FFFFFF',     // White text
    fontSize: 16,        // Medium font size
    lineHeight: 22,      // Line height for readability
  },
});