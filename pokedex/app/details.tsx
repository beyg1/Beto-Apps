import { useLocalSearchParams } from "expo-router/build/hooks";
import { useEffect } from "react";
import { ScrollView, StyleSheet} from "react-native";


export default function Details() {
  const params  = useLocalSearchParams()

  
  useEffect(() => {},[])

  async function fetchDetails(name : string) {
    try{
      //Fetch details logic
    } catch()
  }
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
     
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 15,
    padding: 15,
  },
});