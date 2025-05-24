import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
import { NavigationContainer } from '@react-navigation/native';
import Main from './screens/common/main';
import Login from './screens/student/login';
import DrawerMenu from './components/drawerMenu';
import DetailsEvent from './screens/common/detailsEvent';
import DetailsJob from './screens/common/detailsJob';
import DetailsIntern from './screens/common/detailsIntern';

import LoginOther from './screens/other/login';
import EditEvent from './screens/other/editEvent';
import EditJob from './screens/other/editJob';
import EditIntern from './screens/other/editIntern';
import UserProfile from './screens/student/userProfile';
export default function Navigation() {

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="LoginStudent" component={Login} />
        <Stack.Screen name="Drawer" component={DrawerMenu} />

        <Stack.Screen name="DetailsEvent" component={DetailsEvent} />
        <Stack.Screen name="DetailsJob" component={DetailsJob} />
        <Stack.Screen name="DetailsIntern" component={DetailsIntern} />

        <Stack.Screen name="LoginOther" component={LoginOther} />
        <Stack.Screen name='EditEvent' component={EditEvent} />
        <Stack.Screen name='EditJob' component={EditJob} />
        <Stack.Screen name='EditIntern' component={EditIntern} />


        <Stack.Screen name='UserProfile' component={UserProfile} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
