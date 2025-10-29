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

// TypeScript interfaces for comprehensive Pokemon data
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
    'official-artwork': {
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
}

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

const statNames: Record<string, string> = {
  'hp': 'HP',
  'attack': 'Attack',
  'defense': 'Defense',
  'special-attack': 'Sp. Attack',
  'special-defense': 'Sp. Defense',
  'speed': 'Speed'
};

export default function Details() {
  const params = useLocalSearchParams();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.name) {
      fetchDetails(params.name as string);
    }
  }, [params.name]);

  async function fetchDetails(name: string) {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch main Pokemon data
      const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      if (!pokemonResponse.ok) {
        throw new Error(`Failed to fetch Pokemon: ${pokemonResponse.status}`);
      }
      const pokemonData = await pokemonResponse.json();
      setPokemon(pokemonData);

      // Fetch species data for habitat and flavor text
      const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`);
      if (!speciesResponse.ok) {
        throw new Error(`Failed to fetch species: ${speciesResponse.status}`);
      }
      const speciesData = await speciesResponse.json();
      setSpecies(speciesData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon details');
      console.error('Error fetching Pokemon details:', err);
    } finally {
      setLoading(false);
    }
  }

  const getFlavorText = () => {
    if (!species?.flavor_text_entries) return '';
    
    const englishEntry = species.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    );
    
    return englishEntry ? englishEntry.flavor_text.replace(/\f/g, ' ') : '';
  };

  const getPrimaryTypeColor = () => {
    if (!pokemon?.types.length) return "#68A090";
    const primaryType = pokemon.types[0].type.name;
    return bgColor[primaryType] || "#68A090";
  };

  const getStatColor = (value: number) => {
    if (value >= 100) return "#4CAF50";
    if (value >= 80) return "#8BC34A";
    if (value >= 60) return "#FFC107";
    if (value >= 40) return "#FF9800";
    return "#F44336";
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading Pokemon details...</Text>
      </View>
    );
  }

  if (error || !pokemon) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>
          {error || 'Pokemon not found'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: getPrimaryTypeColor() }]}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.pokemonName}>{pokemon.name}</Text>
        <Text style={styles.pokemonId}>#{pokemon.id.toString().padStart(3, '0')}</Text>
      </View>

      {/* Main Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default || '' }}
          style={styles.mainImage}
          resizeMode="contain"
        />
      </View>

      {/* Sprites Gallery */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gallery</Text>
        <View style={styles.spritesContainer}>
          {pokemon.sprites.front_default && (
            <View style={styles.spriteItem}>
              <Image source={{ uri: pokemon.sprites.front_default }} style={styles.sprite} />
              <Text style={styles.spriteLabel}>Normal</Text>
            </View>
          )}
          {pokemon.sprites.front_shiny && (
            <View style={styles.spriteItem}>
              <Image source={{ uri: pokemon.sprites.front_shiny }} style={styles.sprite} />
              <Text style={styles.spriteLabel}>Shiny</Text>
            </View>
          )}
          {pokemon.sprites.back_default && (
            <View style={styles.spriteItem}>
              <Image source={{ uri: pokemon.sprites.back_default }} style={styles.sprite} />
              <Text style={styles.spriteLabel}>Back</Text>
            </View>
          )}
          {pokemon.sprites.back_shiny && (
            <View style={styles.spriteItem}>
              <Image source={{ uri: pokemon.sprites.back_shiny }} style={styles.sprite} />
              <Text style={styles.spriteLabel}>Shiny Back</Text>
            </View>
          )}
        </View>
      </View>

      {/* Pokemon Types */}
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

      {/* Physical Characteristics */}
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

      {/* Abilities */}
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

      {/* Stats */}
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
                    width: `${Math.min((stat.base_stat / 200) * 100, 100)}%`,
                    backgroundColor: getStatColor(stat.base_stat)
                  }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>

      {/* Habitat and Description */}
      {(species?.habitat || getFlavorText()) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          {species?.habitat && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Habitat</Text>
              <Text style={styles.infoValue}>
                {species.habitat.name.replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
          )}
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

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 15,
    gap: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  pokemonName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
    textTransform: 'capitalize',
  },
  pokemonId: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 5,
  },
  imageContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    marginTop: 10,
  },
  mainImage: {
    width: 250,
    height: 250,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 20,
    borderRadius: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  spritesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 20,
  },
  spriteItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  sprite: {
    width: 100,
    height: 100,
  },
  spriteLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  typesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  typeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  characteristicsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  characteristicItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    minWidth: 100,
  },
  characteristicLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
    marginBottom: 5,
  },
  characteristicValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  abilityItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  abilityName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  hiddenAbility: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  statItem: {
    marginBottom: 15,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  statBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statFill: {
    height: '100%',
    borderRadius: 4,
  },
  infoItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  infoLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
});