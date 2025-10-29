import { ScrollView, Text, View, Image, StyleSheet,} from "react-native";
import { useEffect, useState } from "react";
import { Link } from "expo-router";

interface Pokemon{
  name: string;
  url: string;
  image: string;
  types: string[];
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
}
export default function Index() {
  
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);

  useEffect(() => {
    // fetch pokemons
    fetchPokemons();
  }, [])  

  async function fetchPokemons() {
    try{
      const response = await fetch("https://pokeapi.co/api/v2/pokemon/?limit=10");
      const data = await response.json();
      
      const detailedPokemons = await Promise.all(
        data.results.map(async (pokemon: Pokemon) => {
          const response = await fetch(pokemon.url);
          const data = await response.json();
          return {
            name: data.name,
            image: data.sprites.front_default,
            types: data.types.map((type: any) => type.type.name)
          };
        })
      );

      setPokemons(detailedPokemons);
     
    } catch(e) {
      console.log(e);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
     {pokemons.map((pokemon) => (
      <View key={pokemon.name} style={styles.linkWrapper}>
      <Link
       href={"/details"}
       >
      <View
      style={{
              backgroundColor: (() => {
                const matchingType = pokemon.types.find(type => bgColor[type]);
                return matchingType ? bgColor[matchingType] : "#68A090";
              })(),
              
              borderRadius: 20,
              padding: 20,
              width: "100%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 8,
      }}
      >
        <Text style={styles.name}>{pokemon.name}</Text>
        <Image
          source={{ uri: pokemon.image }}
          style={{ width: 200, height: 200, alignSelf: "center" }}
        />
        <Text style={styles.type}>{pokemon.types.join(", ")}</Text>
      </View>
      </Link>
      </View>
     ) )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  linkWrapper: {
    marginVertical: 10,
  },
  name: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "900",
    paddingVertical: 12,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
    textTransform: "capitalize",
  },
  type: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    paddingVertical: 6,
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});