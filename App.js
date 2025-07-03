
import { enableScreens } from 'react-native-screens';
enableScreens();
import { StyleSheet, Text, View } from 'react-native';
import Router from './config/router';
import { GlobalProvider } from './config/GlobalUser';


export default function App() {
  return (
    <GlobalProvider>
      <Router/>
    </GlobalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',

  },
});
