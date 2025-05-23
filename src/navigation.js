import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
import { NavigationContainer } from '@react-navigation/native';


// Ekran bileşenleri
import MainScreen from './screens/main';
import LoginStudent from './screens/student/login';
import LoginOther from './screens/other/login';
import DrawerMenu from './components/drawerMenu';
import EditActivity from './screens/student/editActivity';
import UserProfile from './screens/student/userProfile';

import DetailsEvent from './screens/student/detailsEvent';
import DetailsJob from './screens/student/detailsJob';
import DetailsIntern from './screens/student/detailsIntern';

export default function Navigation() {

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="LoginStudent" component={LoginStudent} />
        <Stack.Screen name="Drawer" component={DrawerMenu} />

        <Stack.Screen name="DetailsEvent" component={DetailsEvent} />
        <Stack.Screen name="DetailsJob" component={DetailsJob} />
        <Stack.Screen name="DetailsIntern" component={DetailsIntern} />
        
        <Stack.Screen name='UserProfile' component={UserProfile} />

        <Stack.Screen name="LoginOther" component={LoginOther} />
        <Stack.Screen name='EditActivity' component={EditActivity} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
