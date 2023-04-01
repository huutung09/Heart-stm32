import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {Colors, Header} from 'react-native/Libraries/NewAppScreen';
import database from '@react-native-firebase/database';
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryTheme,
} from 'victory-native';
import * as Animatable from 'react-native-animatable';
import {AnimatedGaugeProgress} from 'react-native-simple-gauge';
import PercentageBar from './PercentageBar';

const CustomHeader = () => {
  return (
    <View
      style={{
        backgroundColor: '#1877F2',
        width: '100%',
        height: 200,
        justifyContent: 'center',
      }}>
      <Text
        style={{
          textAlign: 'center',
          color: 'white',
          fontSize: 50,
          fontWeight: 'bold',
        }}>
        Heart App
      </Text>
    </View>
  );
};

function isNumeric(num: string) {
  if (num == "") return false;
  return !isNaN(+num);
}

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentTemp, setCurrentTemp] = useState();
  const [currentHeart, setCurrentHeart] = useState();
  const [currentO, setCurrentO] = useState();
  const [tempChart, setTempChart] = useState<any>();
  const [heartChart, setHeartChart] = useState<any>();
  const [OChart, setOChart] = useState<any>();
  const [timeChart, setTimeChart] = useState<any>();

  useEffect(() => {
    database()
      .ref('/UsersData/XsfbJBHmFIZa22GrBsOkJkK6BBa2')
      .limitToLast(5)
      .on('value', snapshot => {
        if (
          snapshot.val()?.current != null &&
          snapshot.val()?.reading != null
        ) {
          const data = snapshot.val().current;
          const listData = Object.values(snapshot.val().reading).filter(
            item =>
              isNumeric(item.heartRate) &&
              isNumeric(item.temperature) &&
              isNumeric(item.spo2),
          );
          console.log('tung', listData);

          const temp: Array<any> = listData.map((x: any) => x.temperature);
          const o2 = listData.map((x: any) => x.spo2);
          const heart = listData.map((x: any) => x.heartRate);
          const time = listData.map((x: any) => x.timestamp);

          setTempChart(temp);
          setHeartChart(heart);
          setOChart(o2);
          setTimeChart(time);
          if (
            isNumeric(data.heartRate) &&
            isNumeric(data.temperature) &&
            isNumeric(data.spo2)
          ) {
            setCurrentTemp(data.temperature);
            setCurrentO(data.spo2);
            setCurrentHeart(data.heartRate);
          }
        }
      });
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <CustomHeader />
        <View style={styles.body}>
          <View style={styles.cardView}>
            <Text style={styles.infoTitle}>Nhiệt độ hiện tại</Text>
            <PercentageBar
              height={20}
              width={'90%'}
              backgroundColor={'#EEF0F4'}
              completedColor={'orange'}
              percentage={`${currentTemp ? +currentTemp : 0}%`}
              styleProps={{marginStart: 35 / 2}}
            />
            <Text
              style={[
                styles.info,
                {
                  alignSelf: 'center',
                  fontSize: 30,
                  color: 'orange',
                  fontWeight: 'bold',
                  marginBottom: 20,
                },
              ]}>
              {currentTemp} độ C
            </Text>
          </View>
          <View style={styles.cardView}>
            <Text style={styles.infoTitle}>Nhịp tim hiện tại</Text>
            <Animatable.Text
              animation="pulse"
              easing="ease-out"
              iterationCount="infinite"
              style={{textAlign: 'center', color: 'red', fontSize: 100}}>
              ❤️
            </Animatable.Text>
            <Text
              style={[
                styles.info,
                {
                  position: 'absolute',
                  alignSelf: 'center',
                  fontSize: 30,
                  color: 'white',
                  fontWeight: 'bold',
                  bottom: 45,
                },
              ]}>
              {currentHeart}
            </Text>
          </View>
          <View style={styles.cardView}>
            <Text style={styles.infoTitle}>Nồng độ oxy hiện tại</Text>
            <AnimatedGaugeProgress
              size={165}
              width={20}
              fill={currentO ? +currentO : 0}
              cropDegree={100}
              tintColor="#4682b4"
              backgroundColor="#b0c4de"
              style={{alignSelf: 'center'}}
            />
            <Text
              style={[
                styles.info,
                {
                  position: 'absolute',
                  alignSelf: 'center',
                  fontSize: 30,
                  color: '#4682b4',
                  fontWeight: 'bold',
                  top: 120,
                },
              ]}>
              {currentO}
            </Text>
          </View>
        </View>
        <View style={styles.cardView}>
          <Text style={styles.infoTitle}>Nhiệt độ gần đây</Text>
          <GrandChart
            dataArray={tempChart}
            timeArray={timeChart}
            domain={[20, 50]}
            title={'độ C'}
          />
        </View>
        <View style={styles.cardView}>
          <Text style={styles.infoTitle}>Nhịp tim gần đây</Text>
          <GrandChart
            dataArray={heartChart}
            timeArray={timeChart}
            domain={[40, 160]}
            title={'Nhịp'}
          />
        </View>
        <View style={styles.cardView}>
          <Text style={styles.infoTitle}>Nồng độ oxy gần đây</Text>
          <GrandChart
            dataArray={OChart}
            timeArray={timeChart}
            domain={[80, 100]}
            title={'%'}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const GrandChart = ({dataArray, timeArray, domain, title}: any) => {
  const data = getData(dataArray, timeArray);

  return (
    <VictoryChart theme={VictoryTheme.material}>
      <VictoryLine
        style={{
          data: {stroke: '#c43a31'},
          parent: {border: '1px solid #ccc'},
        }}
        data={data}
        scale={{x: 'time', y: 'linear'}}
      />
      <VictoryAxis
        dependentAxis
        style={{
          tickLabels: {fontSize: 12},
        }}
        domain={domain}
        label={title}
        axisLabelComponent={<VictoryLabel angle={0} dy={-140} />}
      />
      <VictoryAxis
        style={{
          tickLabels: {fontSize: 0, color: 'white'},
          grid: {stroke: 'transparent'},
          ticks: {stroke: 'none'},
        }}
        tickFormat={() => ''}
      />
    </VictoryChart>
  );
};

const getData = (value: any, time: any) => {
  if (value && time) {
    const result = value.map((val: number, index: number) => {
      return {
        y: +val,
        x: time[index],
      };
    });
    return result;
  } else {
    return [];
  }
};

const styles = StyleSheet.create({
  body: {
    justifyContent: 'center',
  },
  cardView: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
    backgroundColor: 'white',
    justifyContent: 'center',
    flex: 1,
    margin: 15,
  },

  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginVertical: 20,
  },
  info: {
    textAlign: 'center',
  },
});

export default App;
